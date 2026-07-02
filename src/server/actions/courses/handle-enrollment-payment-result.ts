import { db } from "@/lib/db";
import type { PaymentResult } from "@/lib/payments/types";

export type HandleEnrollmentResultOutcome = { ok: true } | { ok: false; reason: string };

/**
 * נקודת אמת יחידה לעדכון סטטוס תשלום קורס — נקראת מ-course-mock-callback
 * וגם (בעתיד) מה-webhook האמיתי. מקבילה ל-handle-payment-result של החנות אך
 * **מאמתת מול `CoursePayment.amountAgorot` הספציפי של העסקה** (מקדמה/מלא/
 * יתרה), לא מול מחיר הקורס — כך תשלום מקדמה חלקי עובר ולא מסומן mismatch.
 *
 * `result.orderId` כאן הוא `CoursePayment.id` (הועבר כ-orderId ל-createCheckout
 * דרך create-enrollment/pay-balance — ראה שם).
 *
 * Idempotent: no-op אם ה-CoursePayment כבר לא PENDING.
 */
export async function handleEnrollmentPaymentResult(
  result: PaymentResult,
): Promise<HandleEnrollmentResultOutcome> {
  const payment = await db.coursePayment.findUnique({
    where: { id: result.orderId },
    include: { enrollment: true },
  });

  if (!payment || !payment.enrollment) {
    console.error("[courses] handleEnrollmentPaymentResult: payment/enrollment not found", result.orderId);
    return { ok: false, reason: "payment not found" };
  }

  if (payment.status !== "PENDING") {
    // כבר טופל — callback/webhook כפול, מתעלמים בשקט (idempotency).
    return { ok: true };
  }

  const enrollment = payment.enrollment;

  if (!result.ok) {
    await db.$transaction([
      db.coursePayment.update({
        where: { id: payment.id },
        data: { status: "FAILED", failureReason: result.reason },
      }),
      // כישלון התשלום הראשון (הרשמה עדיין PENDING) → ההרשמה נכשלה. אם כבר
      // שולמה מקדמה (DEPOSIT_PAID) וכשל תשלום יתרה — משאירים DEPOSIT_PAID.
      ...(enrollment.status === "PENDING"
        ? [db.enrollment.update({ where: { id: enrollment.id }, data: { status: "FAILED" } })]
        : []),
    ]);
    return { ok: true };
  }

  // הגנת עומק: הסכום שאומת מול הספק חייב להתאים לסכום הספציפי של העסקה הזו.
  if (result.amountAgorot !== payment.amountAgorot) {
    console.error(
      "[courses] handleEnrollmentPaymentResult: amount mismatch",
      enrollment.enrollmentNumber,
      result.amountAgorot,
      payment.amountAgorot,
    );
    await db.coursePayment.update({
      where: { id: payment.id },
      data: { status: "FAILED", failureReason: "amount mismatch" },
    });
    return { ok: false, reason: "amount mismatch" };
  }

  const newAmountPaid = enrollment.amountPaidAgorot + payment.amountAgorot;
  const newStatus = newAmountPaid >= enrollment.coursePriceAgorot ? "PAID" : "DEPOSIT_PAID";

  await db.$transaction([
    db.coursePayment.update({
      where: { id: payment.id },
      data: {
        status: "SUCCEEDED",
        externalRef: result.providerRef,
        last4: result.last4,
        rawResponseMeta: { verifiedAt: new Date().toISOString() },
      },
    }),
    db.enrollment.update({
      where: { id: enrollment.id },
      data: { amountPaidAgorot: newAmountPaid, status: newStatus },
    }),
  ]);
  // המקום "נתפס" מרגע DEPOSIT_PAID/PAID — נספר דינמית ב-getCourseBySlug/
  // create-enrollment, אין counter נפרד לתחזק.

  await sendEnrollmentConfirmationEmail(
    enrollment.customerEmail,
    enrollment.customerName,
    enrollment.enrollmentNumber,
    enrollment.courseNameHeSnapshot,
    payment.amountAgorot,
    newStatus,
    enrollment.coursePriceAgorot - newAmountPaid,
  );

  return { ok: true };
}

/** מייל אישור תשלום קורס — best-effort, לא מפיל את הטיפול בתשלום אם נכשל. */
async function sendEnrollmentConfirmationEmail(
  toEmail: string,
  toName: string,
  enrollmentNumber: string,
  courseName: string,
  paidAgorot: number,
  status: "DEPOSIT_PAID" | "PAID",
  balanceAgorot: number,
): Promise<void> {
  if (!process.env.BREVO_API_KEY) {
    if (process.env.NODE_ENV === "development") {
      console.info("[courses] (dev) מייל אישור לא נשלח — BREVO_API_KEY חסר", enrollmentNumber);
    }
    return;
  }

  try {
    const paid = (paidAgorot / 100).toFixed(2);
    const balanceLine =
      status === "DEPOSIT_PAID"
        ? `\nיתרה לתשלום: ${(balanceAgorot / 100).toFixed(2)}₪ (ניתן לשלם באזור האישי).`
        : "";
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: "ReStyle Academy",
          email: process.env.BREVO_SENDER_EMAIL ?? "noreply@restyle.co.il",
        },
        to: [{ email: toEmail, name: toName }],
        subject: `אישור הרשמה — ${courseName} (${enrollmentNumber})`,
        textContent: `שלום ${toName},\n\nההרשמה לקורס "${courseName}" (${enrollmentNumber}) התקבלה.\nשולם: ${paid}₪.${balanceLine}\n\nנתראה ב-ReStyle Academy!`,
      }),
    });
    if (!response.ok) {
      console.error("[courses] שליחת מייל אישור נכשלה", enrollmentNumber, response.status);
    }
  } catch (err) {
    console.error("[courses] שליחת מייל אישור זרקה שגיאה", enrollmentNumber, err);
  }
}
