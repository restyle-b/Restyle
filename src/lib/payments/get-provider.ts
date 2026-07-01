import type { PaymentProvider } from "@/lib/payments/types";
import { mockProvider } from "@/lib/payments/mock-provider";
import { tranzilaProvider } from "@/lib/payments/tranzila-provider";

/**
 * בחירת ספק תשלום לפי PAYMENT_PROVIDER. ברירת מחדל בטוחה: כל ערך שאינו
 * בדיוק "tranzila" (כולל חסר/typo) נופל ל-mock — לעולם לא מפעילים תשלום
 * חי בטעות בגלל env שגוי.
 */
export function getPaymentProvider(): PaymentProvider {
  if (process.env.PAYMENT_PROVIDER === "tranzila") return tranzilaProvider;
  return mockProvider;
}
