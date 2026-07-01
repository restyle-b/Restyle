import { randomInt } from "node:crypto";
import { db } from "@/lib/db";

/**
 * מספר הזמנה קריא ללקוח — לא sequential/ניתן-לניחוש (לא autoincrement),
 * כדי לא לחשוף נפח הזמנות דרך ה-URL. פורמט: R-XXXXXX (6 ספרות אקראיות).
 * בודק ייחודיות מול ה-DB עם retry (התנגשות אקראית אפשרית אך נדירה מאוד).
 */
export async function generateOrderNumber(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = `R-${randomInt(100000, 1000000)}`;
    const existing = await db.order.findUnique({ where: { orderNumber: candidate }, select: { id: true } });
    if (!existing) return candidate;
  }
  throw new Error("generateOrderNumber: failed to find a unique order number after 10 attempts");
}
