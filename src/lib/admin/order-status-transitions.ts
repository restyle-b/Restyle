import type { OrderStatus } from "@prisma/client";

/**
 * מעברי סטטוס מותרים לעדכון ידני ע"י אדמין — allow-list מפורש, לא כל-לכל.
 * COMPLETED/FAILED אינם ניתנים לשינוי ידני: FAILED נקבע רק ע"י
 * handle-payment-result.ts, COMPLETED הוא מצב סופי. **לא נוגע ב-Payment ולא
 * מפעיל refund** — זה scope עתידי נפרד, ראה docs/features/shop.md.
 *
 * קובץ נפרד (לא בתוך src/server/actions/admin/orders.ts) כי קבצי "use server"
 * מותר להם לייצא רק async functions — אובייקט קבוע כאן משותף בין ה-action
 * (אכיפה אמיתית) לקומפוננטת הלקוח (רמזי UI בלבד).
 */
export const ALLOWED_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CANCELLED"],
  PAID: ["FULFILLED", "CANCELLED"],
  FULFILLED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: ["PENDING"],
  FAILED: [],
};
