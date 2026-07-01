import type { PaymentProvider } from "@/lib/payments/types";
import { mockProvider } from "@/lib/payments/mock-provider";
import { tranzilaProvider } from "@/lib/payments/tranzila-provider";
import { isMockCheckoutAllowed } from "@/lib/payments/mock-allowed";

/**
 * בחירת ספק תשלום לפי PAYMENT_PROVIDER. ברירת מחדל בטוחה: כל ערך שאינו
 * בדיוק "tranzila" (כולל חסר/typo) נופל ל-mock — לעולם לא מפעילים תשלום
 * חי בטעות בגלל env שגוי.
 *
 * **כשל closed**: ב-production בלי `PAYMENT_PROVIDER=tranzila` ובלי opt-in
 * מפורש ל-mock — זורק, כך ש-createCheckout נכשל (create-order מחזיר שגיאה)
 * במקום לפתוח מסלול תשלום מדומה שמסמן שולם בחינם. ראה mock-allowed.ts.
 */
export function getPaymentProvider(): PaymentProvider {
  if (process.env.PAYMENT_PROVIDER === "tranzila") return tranzilaProvider;
  if (!isMockCheckoutAllowed()) {
    throw new Error(
      "MockProvider חסום ב-production. הגדר PAYMENT_PROVIDER=tranzila (סליקה אמיתית) " +
        "או ALLOW_MOCK_CHECKOUT=true (preview/דמו בלבד).",
    );
  }
  return mockProvider;
}
