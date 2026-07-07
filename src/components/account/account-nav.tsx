"use client";

import NextLink from "next/link";
import { LayoutDashboard, Package, GraduationCap, Heart, MapPin, User, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { cn } from "@/lib/utils";

export type AccountNavItem = { href: string; label: string };

// אייקונים מוגדרים כאן, בקומפוננטת הלקוח עצמה — לא מועברים כ-prop משכבת ה-
// server layout: קומפוננטת lucide-react היא function/forwardRef, ו-React
// חוסם העברת רפרנס-פונקציה גולמי מ-Server ל-Client component (נתפס בפועל:
// "Functions cannot be passed directly to Client Components"). אותו דפוס
// בדיוק כמו components/admin/sidebar-nav.tsx (אייקונים מקומיים לקובץ ה-client).
const ICON_BY_HREF: Record<string, LucideIcon> = {
  "/account": LayoutDashboard,
  "/account/orders": Package,
  "/account/courses": GraduationCap,
  "/account/wishlist": Heart,
  "/account/addresses": MapPin,
  "/account/profile": User,
};

/**
 * ניווט הסיידבר של האזור האישי — מראה זהה ללוגיקת ה-active של
 * components/admin/sidebar-nav.tsx (התאמה מדויקת ל-/account, startsWith
 * לילדים), אך עם i18n Link (הנתיבים כאן חיים תחת [locale], בשונה מ-/admin).
 * קיצור-הדרך לפאנל ניהול + התנתקות מוצמדים לתחתית (mt-auto, border-t).
 */
export function AccountNav({
  items,
  isAdmin,
  adminLabel,
}: {
  items: AccountNavItem[];
  isAdmin: boolean;
  adminLabel: string;
}) {
  const pathname = usePathname();

  return (
    <>
      <nav className="flex flex-1 flex-col gap-1">
        {items.map((item) => {
          const isActive = item.href === "/account" ? pathname === "/account" : pathname.startsWith(item.href);
          const Icon = ICON_BY_HREF[item.href] ?? LayoutDashboard;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-white/10 font-medium text-white"
                  : "text-neutral-400 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto flex flex-col gap-2 border-t border-line-dark pt-4">
        {isAdmin && (
          // /admin חי מחוץ ל-[locale] — קישור חייב להיות next/link רגיל, לא ה-Link
          // המקומי של next-intl (שהיה מוסיף prefix שפה שגוי, ראה src/middleware.ts).
          <NextLink
            href="/admin"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-neutral-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
            {adminLabel}
          </NextLink>
        )}
        <SignOutButton className="w-full justify-center" />
      </div>
    </>
  );
}
