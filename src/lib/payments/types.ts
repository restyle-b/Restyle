/**
 * ממשק PaymentProvider — הפשטה מעל ספק סליקה, כדי שלא נהיה כבולים לספק אחד.
 * ראה docs/features/shop.md §PaymentProvider ו-.claude/skills/tranzila-payments/SKILL.md.
 * `amountAgorot` תמיד מחושב בשרת (create-order.ts) — לעולם לא מגיע מהקליינט.
 */

export type CheckoutInput = {
  orderId: string; // Order.id / Enrollment.id (cuid) — משמש כמפתח idempotency
  orderNumber: string; // מספר קריא ללקוח, מוצג גם לספק כ-reference
  amountAgorot: number;
  customerEmail: string;
  customerName: string;
  locale: string;
  returnUrls: { success: string; cancel: string };
  /**
   * סוג הישות המשלמת — קובע לאיזה callback ה-MockProvider מנתב (הזמנת חנות
   * מול הרשמה לקורס). ברירת מחדל "order". Tranzila מתעלם משדה זה.
   */
  kind?: "order" | "enrollment";
};

export type CheckoutResult = {
  redirectUrl: string; // iframe src / hosted page URL
  providerRef: string; // מזהה עסקה/session בצד הספק
};

export type PaymentResult =
  | { ok: true; orderId: string; providerRef: string; amountAgorot: number; last4?: string }
  | { ok: false; orderId: string; reason: string };

export type RefundResult = { ok: true; refundRef: string } | { ok: false; reason: string };

export interface PaymentProvider {
  createCheckout(input: CheckoutInput): Promise<CheckoutResult>;
  /** אימות callback — כולל idempotency ואימות server-to-server, לא רק פענוח body. */
  verifyCallback(req: Request): Promise<PaymentResult>;
  refund(providerRef: string, amountAgorot: number): Promise<RefundResult>;
}
