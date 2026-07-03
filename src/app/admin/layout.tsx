import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { AdminNav } from "@/components/admin/admin-nav";
import "../globals.css";

export const metadata: Metadata = {
  title: "ניהול | ReStyle",
  robots: { index: false, follow: false },
};

// תלוי ב-cookies()/Supabase בכל בקשה — אסור רינדור סטטי בזמן build.
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // הגנה כפולה — ה-middleware חוסם /admin למשתמש לא מחובר, אך בדיקת ה-role
  // נעשית רק כאן (Prisma לא רץ ב-Edge runtime של ה-middleware).
  await requireAdmin();

  // /admin יושב מחוץ ל-[locale] (לא מתורגם), ולכן אין לו root layout משותף
  // עם שאר האתר — הוא חייב להגדיר <html>/<body> בעצמו, אחרת Tailwind
  // (globals.css) לא נטען וה-RTL/lang לא מוגדרים בכלל.
  return (
    <html dir="rtl" lang="he">
      <body className="min-h-screen bg-ink text-white">
        <div className="min-h-screen">
          <header className="border-b border-line-dark">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
              <Link href="/admin" className="font-semibold shrink-0">
                ניהול ReStyle
              </Link>
              <AdminNav />
              <SignOutButton />
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
