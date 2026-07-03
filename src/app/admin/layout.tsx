import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/require-admin";
import { Sidebar } from "@/components/admin/sidebar";
import { Topbar } from "@/components/admin/topbar";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
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
  const admin = await requireAdmin();

  // /admin יושב מחוץ ל-[locale] (לא מתורגם), ולכן אין לו root layout משותף
  // עם שאר האתר — הוא חייב להגדיר <html>/<body> בעצמו, אחרת Tailwind
  // (globals.css) לא נטען וה-RTL/lang לא מוגדרים בכלל.
  return (
    <html dir="rtl" lang="he">
      <body className="min-h-screen bg-ink text-white">
        <TooltipProvider delayDuration={300}>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col">
              <Topbar email={admin.email} />
              <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-10">{children}</main>
            </div>
          </div>
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
