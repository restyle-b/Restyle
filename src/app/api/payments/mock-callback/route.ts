import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mockProvider } from "@/lib/payments/mock-provider";
import { isMockCheckoutAllowed } from "@/lib/payments/mock-allowed";
import { handlePaymentResult } from "@/server/actions/orders/handle-payment-result";

/**
 * Callback של ספק התשלום המדומה — לפיתוח/preview בלבד. חסום ב-production
 * (אלא אם ALLOW_MOCK_CHECKOUT=true) וגם כש-PAYMENT_PROVIDER==="tranzila" —
 * אחרת אפשר היה "לשלם" בחינם דרך המסלול הזה. ראה mock-allowed.ts.
 *
 * הגנת עומק נוספת: לפני שקוראים ל-handlePaymentResult, מוודאים ש-providerRef
 * שנשלח תואם בדיוק את מה שנשמר ב-Payment.externalRef בזמן יצירת ההזמנה —
 * כך שלא מספיק להכיר/לנחש orderId (cuid) כדי "לשלם" הזמנה של מישהו אחר.
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

  const payment = await db.payment.findUnique({ where: { orderId: bodyForCheck.orderId } });
  if (!payment || payment.externalRef !== bodyForCheck.providerRef) {
    return NextResponse.json({ ok: false, error: "invalid providerRef" }, { status: 400 });
  }

  const result = await mockProvider.verifyCallback(req);
  const outcome = await handlePaymentResult(result);
  return NextResponse.json(outcome, { status: outcome.ok ? 200 : 400 });
}
