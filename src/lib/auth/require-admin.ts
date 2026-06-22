import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

/**
 * שכבת הרשאה ל-Admin — בודקת session דרך Supabase ואז role==='ADMIN' ב-Prisma.
 * Fail closed: כל מקרה לא ברור (אין session, אין שורת user, role שגוי) מפנה
 * החוצה. נקרא גם ב-`admin/layout.tsx` וגם בתחילת כל admin server action
 * (defense in depth — לא להסתמך על שכבה אחת).
 */
export async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    redirect("/login?next=/admin");
  }

  const user = await db.user.findUnique({ where: { id: data.user.id } });
  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  return user;
}
