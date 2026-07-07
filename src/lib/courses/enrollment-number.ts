import { randomInt } from "node:crypto";
import { db } from "@/lib/db";

/**
 * מספר הרשמה קריא ללקוח — לא sequential/ניתן-לניחוש. פורמט: C-XXXXXX
 * (6 ספרות אקראיות). מקביל ל-generateOrderNumber (order-number.ts) אך
 * לקורסים. בודק ייחודיות מול ה-DB עם retry.
 */
export async function generateEnrollmentNumber(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = `C-${randomInt(100000, 1000000)}`;
    const existing = await db.enrollment.findUnique({
      where: { enrollmentNumber: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
  }
  throw new Error("generateEnrollmentNumber: failed to find a unique number after 10 attempts");
}
