import type { OrderStatus } from "@prisma/client";

/**
 * סטטוסים שאינם נחשבים "הכנסה" — תואם בדיוק את ההגדרה הקיימת ב-
 * getOrdersOverview (server/actions/admin/orders.ts): כל הזמנה שלא בוטלה
 * ולא נכשלה נחשבת בהכנסות (גם PENDING, טרם שולמה בפועל — הגדרה קיימת,
 * לא הומצאה כאן מחדש). מיובא גם ב-orders.ts כדי לא לשכפל את הרשימה.
 */
export const NON_REVENUE_ORDER_STATUSES: OrderStatus[] = ["CANCELLED", "FAILED"];
