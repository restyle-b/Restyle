import { db } from "@/lib/db";
import type { PaymentResult } from "@/lib/payments/types";

export type HandlePaymentResultOutcome = { ok: true } | { ok: false; reason: string };

/**
 * נקודת אמת יחידה לעדכון סטטוס תשלום — נקראת גם מ-mock-callback וגם
 * (בעתיד) מ-webhook האמיתי של Tranzila, כך ששתי הזרימות עוברות באותה
 * לוגיקה בדיוק. **Idempotent**: אם ה-Payment כבר לא PENDING, לא עושים
 * כלום (callback כפול/webhook שנשלח פעמיים לא יגרום לתופעות לוואי).
 *
 * מלאי יורד **רק כאן** (בתשלום מאומת), לא בעת יצירת ההזמנה — הוחלט מראש
 * מול המשתמש; הסיכון של race condition על יחידת מלאי אחרונה מתקבל.
 */
export async function handlePaymentResult(
  result: PaymentResult,
): Promise<HandlePaymentResultOutcome> {
  const order = await db.order.findUnique({
    where: { id: result.orderId },
    include: { payment: true, items: true, couponRedemption: true },
  });

  if (!order || !order.payment) {
    console.error("[payments] handlePaymentResult: order/payment not found", result.orderId);
    return { ok: false, reason: "order not found" };
  }

  if (order.payment.status !== "PENDING") {
    // כבר טופל — callback/webhook כפול, מתעלמים בשקט (idempotency)
    return { ok: true };
  }

  // שחרור מימוש קופון ששמור להזמנה זו (reserve-at-creation) — נקרא משני
  // הענפים הבאים (FAILED / אי-התאמת סכום) בלבד, לעולם לא בענף SUCCEEDED
  // (הזמנה ששולמה בפועל שומרת על המימוש שלה לצמיתות). ראה
  // docs/features/platform-upgrade/promotion-engine.md §4-§5.
  const releaseCouponOps = order.couponRedemption
    ? [
        db.couponRedemption.delete({ where: { id: order.couponRedemption.id } }),
        db.coupon.update({
          where: { id: order.couponRedemption.couponId },
          data: { usedCount: { decrement: 1 } },
        }),
      ]
    : [];

  if (!result.ok) {
    await db.$transaction([
      db.payment.update({
        where: { id: order.payment.id },
        data: { status: "FAILED", failureReason: result.reason },
      }),
      db.order.update({ where: { id: order.id }, data: { status: "FAILED" } }),
      db.orderStatusEvent.create({
        data: { orderId: order.id, fromStatus: order.status, toStatus: "FAILED", changedBy: "payment" },
      }),
      ...releaseCouponOps,
    ]);
    return { ok: true };
  }

  // הגנת עומק: הסכום שאומת מול הספק חייב להתאים לסכום שחושב בשרת ביצירת
  // ההזמנה — אי-התאמה מסמנת תקלה/ניסיון מניפולציה ולא מסמנים כשולם.
  if (result.amountAgorot !== order.totalAgorot) {
    console.error(
      "[payments] handlePaymentResult: amount mismatch",
      order.orderNumber,
      result.amountAgorot,
      order.totalAgorot,
    );
    await db.$transaction([
      db.payment.update({
        where: { id: order.payment.id },
        data: { status: "FAILED", failureReason: "amount mismatch" },
      }),
      db.order.update({ where: { id: order.id }, data: { status: "FAILED" } }),
      db.orderStatusEvent.create({
        data: { orderId: order.id, fromStatus: order.status, toStatus: "FAILED", changedBy: "payment" },
      }),
      ...releaseCouponOps,
    ]);
    return { ok: false, reason: "amount mismatch" };
  }

  // טרנזקציה אינטראקטיבית (לא מערך) — כדי שכל ירידת מלאי תדע את ה-resultingStock
  // שלה עצמה (Phase 17 / M5, InventoryEvent.resultingStock הוא snapshot, לא נגזר
  // אחר-כך). מלאי יורד **רק כאן** (בתשלום מאומת), כמו קודם.
  await db.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: order.payment!.id },
      data: {
        status: "SUCCEEDED",
        externalRef: result.providerRef,
        last4: result.last4,
        rawResponseMeta: { verifiedAt: new Date().toISOString() },
      },
    });
    await tx.order.update({ where: { id: order.id }, data: { status: "PAID" } });
    await tx.orderStatusEvent.create({
      data: { orderId: order.id, fromStatus: order.status, toStatus: "PAID", changedBy: "payment" },
    });

    for (const item of order.items) {
      if (!item.productId) continue;
      const updated = await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
      await tx.inventoryEvent.create({
        data: {
          productId: item.productId,
          delta: -item.quantity,
          reason: "SALE",
          resultingStock: updated.stock,
          orderId: order.id,
          actorEmail: "payment",
        },
      });
    }
  });

  await sendPaymentConfirmationEmail(order.customerEmail, order.customerName, order.orderNumber, order.totalAgorot);

  return { ok: true };
}

/** מייל אישור תשלום — best-effort, לא מפיל את הטיפול בתשלום אם נכשל. */
async function sendPaymentConfirmationEmail(
  toEmail: string,
  toName: string,
  orderNumber: string,
  totalAgorot: number,
): Promise<void> {
  if (!process.env.BREVO_API_KEY) {
    if (process.env.NODE_ENV === "development") {
      console.info("[payments] (dev) מייל אישור תשלום לא נשלח — BREVO_API_KEY חסר", orderNumber);
    }
    return;
  }

  try {
    const shekels = (totalAgorot / 100).toFixed(2);
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: "ReStyle",
          email: process.env.BREVO_SENDER_EMAIL ?? "noreply@restyle.co.il",
        },
        to: [{ email: toEmail, name: toName }],
        subject: `אישור תשלום — הזמנה ${orderNumber}`,
        textContent: `שלום ${toName},\n\nהתשלום עבור הזמנה ${orderNumber} בסך ${shekels}₪ התקבל בהצלחה.\n\nתודה שקנית ב-ReStyle!`,
      }),
    });
    if (!response.ok) {
      console.error("[payments] שליחת מייל אישור תשלום נכשלה", orderNumber, response.status);
    }
  } catch (err) {
    console.error("[payments] שליחת מייל אישור תשלום זרקה שגיאה", orderNumber, err);
  }
}
