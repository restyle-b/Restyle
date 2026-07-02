import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mockProvider } from "@/lib/payments/mock-provider";
import { isMockCheckoutAllowed } from "@/lib/payments/mock-allowed";
import { handleEnrollmentPaymentResult } from "@/server/actions/courses/handle-enrollment-payment-result";

/**
 * Callback של ספק התשלום המדומה עבור הרשמות לקורסים — מקביל ל-
 * /api/payments/mock-callback של החנות. חסום ב-production ללא
 * ALLOW_MOCK_CHECKOUT, וגם כש-PAYMENT_PROVIDER==="tranzila".
 *
 * הגנת עומק: מאמת ש-providerRef תואם את `CoursePayment.externalRef` (לפי
 * orderId = CoursePayment.id) לפני קריאה ל-handler — כך שלא מספיק להכיר
 * את מזהה התשלום כדי לזייף אישור.
 */
export async function POST(req: Request) {
  if (process.env.PAYMENT_PROVIDER === "tranzila" || !isMockCheckoutAllowed()) {
    return NextResponse.json({ ok: false, error: "mock callback disabled" }, { status: 403 });
  }

  let bodyForCheck: { orderId?: string; providerRef?: string };
  try {
    bodyForCheck = (await req.clone().json()) as { orderId?: string; providerRef?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON" }, { status: 400 });
  }

  if (!bodyForCheck.orderId || !bodyForCheck.providerRef) {
    return NextResponse.json({ ok: false, error: "invalid payload" }, { status: 400 });
  }

  const payment = await db.coursePayment.findUnique({ where: { id: bodyForCheck.orderId } });
  if (!payment || payment.externalRef !== bodyForCheck.providerRef) {
    return NextResponse.json({ ok: false, error: "invalid providerRef" }, { status: 400 });
  }

  const result = await mockProvider.verifyCallback(req);
  const outcome = await handleEnrollmentPaymentResult(result);
  return NextResponse.json(outcome, { status: outcome.ok ? 200 : 400 });
}
