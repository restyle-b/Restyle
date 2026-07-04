import { createSupabaseServerClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

/**
 * שורת ה-Prisma (כולל role) של המשתמש המחובר כרגע, או null אם אין session.
 * בשונה מ-requireAdmin() — לא מפנה החוצה, מיועד לבדיקות תצוגה מותנית
 * (למשל קיצור-דרך לאדמין באזור האישי). אכיפת ההרשאה בפועל נשארת ב-requireAdmin()
 * ובמידלוור — זו רק קריאת מידע.
 */
export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  return db.user.findUnique({ where: { id: data.user.id } });
}
