import { randomBytes } from "node:crypto";
import { getPathname } from "@/i18n/navigation";
import type { CheckoutInput, CheckoutResult, PaymentProvider, PaymentResult, RefundResult } from "@/lib/payments/types";

/**
 * ספק תשלום מדומה — לפיתוח/בדיקות בלבד. **חסום ב-production אם
 * PAYMENT_PROVIDER==="tranzila"** (נבדק ב-get-provider.ts + בדף ה-mock-pay
 * עצמו) כדי שלא יהיה ניתן לעקוף תשלום אמיתי דרכו בטעות.
 */
export const mockProvider: PaymentProvider = {
  async createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
    const providerRef = `mock_${randomBytes(12).toString("hex")}`;
    const redirectUrl = getPathname({
      href: {
        pathname: "/checkout/mock-pay",
        query: {
          order: input.orderNumber,
          oid: input.orderId,
          ref: providerRef,
          amount: String(input.amountAgorot),
        },
      },
      locale: input.locale as never,
    });
    return { redirectUrl, providerRef };
  },

  async verifyCallback(req: Request): Promise<PaymentResult> {
    const body = (await req.json()) as {
      orderId?: string;
      providerRef?: string;
      amountAgorot?: number;
      outcome?: "success" | "failure";
    };
    if (!body.orderId || !body.providerRef || typeof body.amountAgorot !== "number") {
      return { ok: false, orderId: body.orderId ?? "", reason: "invalid mock callback payload" };
    }
    if (body.outcome !== "success") {
      return { ok: false, orderId: body.orderId, reason: "simulated failure" };
    }
    return {
      ok: true,
      orderId: body.orderId,
      providerRef: body.providerRef,
      amountAgorot: body.amountAgorot,
      last4: "4242",
    };
  },

  async refund(providerRef: string): Promise<RefundResult> {
    return { ok: true, refundRef: `mock_refund_${providerRef}` };
  },
};
