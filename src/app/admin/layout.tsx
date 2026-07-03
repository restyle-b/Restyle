import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { SignOutButton } from "@/components/auth/sign-out-button";
import "../globals.css";

export const metadata: Metadata = {
  title: "ניהול | ReStyle",
  robots: { index: false, follow: false },
};

// תלוי ב-cookies()/Supabase בכל בקשה — אסור רינדור סטטי בזמן build.
export const dynamic = "force-dynamic";

const NAV_LINKS = [
  { href: "/admin", label: "דשבורד" },
  { href: "/admin/settings", label: "הגדרות אתר" },
  { href: "/admin/courses", label: "קורסים" },
  { href: "/admin/testimonials", label: "המלצות" },
  { href: "/admin/gallery", label: "גלריה" },
  { href: "/admin/content", label: "טקסטי האתר" },
  { href: "/admin/products", label: "מוצרים" },
  { href: "/admin/categories", label: "קטגוריות" },
  { href: "/admin/orders", label: "הזמנות" },
  { href: "/admin/enrollments", label: "הרשמות לקורסים" },
] as const;

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
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <nav className="flex items-center gap-6">
                <span className="font-semibold">ניהול ReStyle</span>
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-neutral-300 hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <SignOutButton />
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
