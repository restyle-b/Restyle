import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { tranzilaProvider } from "@/lib/payments/tranzila-provider";
import { handlePaymentResult } from "@/server/actions/orders/handle-payment-result";
import { handleEnrollmentPaymentResult } from "@/server/actions/courses/handle-enrollment-payment-result";

/** השוואת secret בזמן קבוע — מונע timing attack על השוואת header (10/10 קריטיות, ראה SKILL.md). */
function secretsMatch(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Webhook אמיתי של Tranzila — server-to-server. לא רלוונטי בפועל עד שיהיו
 * credentials אמיתיים (`TRANZILA_TERMINAL`/`TRANZILA_TERMINAL_PASSWORD`),
 * אך מחווט נכון מראש. `tranzilaProvider.verifyCallback` כבר עושה קריאת
 * Inquire נוספת server-to-server לפני שמאשר תשלום — לא סומך על גוף הבקשה
 * בלבד (ראה .claude/skills/tranzila-payments/SKILL.md).
 *
 * אם `PAYMENT_WEBHOOK_SECRET` מוגדר — דורש header `x-webhook-secret` תואם
 * (הגנת-עומק, לא תחליף ל-Inquire). אם לא מוגדר — ממשיך (Tranzila לא מחובר
 * עדיין) עם אזהרה בלוג.
 */
export async function POST(req: Request) {
  const expectedSecret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (expectedSecret) {
    const providedSecret = req.headers.get("x-webhook-secret");
    if (!providedSecret || !secretsMatch(providedSecret, expectedSecret)) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
  } else {
    console.warn("[payments] PAYMENT_WEBHOOK_SECRET לא מוגדר — webhook פתוח ללא אימות header");
  }

  const result = await tranzilaProvider.verifyCallback(req);

  // ניתוב: מנסים קודם הזמנת חנות (result.orderId = Order.id); אם לא נמצאה,
  // מנסים הרשמה לקורס (result.orderId = CoursePayment.id). שני ה-handlers
  // מחפשים בטבלאות שונות לפי אותו id, כך שהניסיון בטוח. best-effort —
  // Tranzila לא מחובר בפועל; ראה handle-enrollment-payment-result.ts.
  const orderOutcome = await handlePaymentResult(result);
  if (!orderOutcome.ok && orderOutcome.reason === "order not found") {
    const enrollmentOutcome = await handleEnrollmentPaymentResult(result);
    return NextResponse.json(enrollmentOutcome, { status: enrollmentOutcome.ok ? 200 : 400 });
  }
  return NextResponse.json(orderOutcome, { status: orderOutcome.ok ? 200 : 400 });
}
