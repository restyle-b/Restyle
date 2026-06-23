import { PrismaClient } from "@prisma/client";

/**
 * Prisma client כ-singleton (מונע ריבוי חיבורים ב-dev/hot-reload).
 * החיבור עצל — נוצר רק בשאילתה הראשונה (לא בעת import).
 *
 * ⚠️ אבטחה: `DATABASE_URL` מתחבר כ-role `postgres.<project-ref>` (Supabase
 * pooler) — role זה עוקף RLS לחלוטין (RLS חל רק על חיבורים דרך PostgREST עם
 * JWT anon/authenticated). כל ה-policies שמוגדרים במיגרציות הם הגנת-עומק
 * תיאורטית למקרה עתידי של קריאה ישירה מ-client — **לא** ההגנה האקטיבית.
 * ההגנה האקטיבית האמיתית על קוד שמשתמש ב-`db` (כל server action) היא
 * בדיקת ההרשאה בקוד עצמו (`requireAdmin()`, `auth.getUser()`) — לא לסמוך
 * על RLS כשניגשים לדאטה דרך `db`.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
