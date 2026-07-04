"use client";

import { useState } from "react";
import NextLink from "next/link";
import { LayoutDashboard, Package, GraduationCap, Heart, MoreHorizontal, MapPin, User, ShieldCheck } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/account", key: "dashboard", icon: LayoutDashboard },
  { href: "/account/orders", key: "orders", icon: Package },
  { href: "/account/courses", key: "courses", icon: GraduationCap },
  { href: "/account/wishlist", key: "wishlist", icon: Heart },
] as const;

export type AccountNavLabels = {
  dashboard: string;
  orders: string;
  courses: string;
  wishlist: string;
  addresses: string;
  profile: string;
  more: string;
  adminPanel: string;
};

/**
 * ניווט נייד — bottom tab bar קבוע (לא Sheet שני, לאתר יש כבר את המבורגר
 * ה-Sheet הראשי). מקסימום 5 טאבים + "עוד" שפותח Sheet קטן עם הפריטים
 * שלא נכנסו (כתובות/פרופיל/פאנל ניהול/התנתקות). ראה ux-spec.md §A1.
 */
export function AccountMobileNav({ labels, isAdmin }: { labels: AccountNavLabels; isAdmin: boolean }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      <nav
        // data-account-mobile-nav: hook יציב (לא תלוי-שפה) ל-CSS ב-globals.css
        // שמרים עליו את הכפתורים הצפים (יצירת קשר/נגישות) כדי שלא יתנגשו.
        data-account-mobile-nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line-dark bg-ink/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
        aria-label={labels.more}
      >
        <div className="grid grid-cols-5">
          {TABS.map((tab) => {
            const isActive = tab.href === "/account" ? pathname === "/account" : pathname.startsWith(tab.href);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex flex-col items-center gap-1 py-2.5 text-[11px]",
                  isActive ? "text-white" : "text-neutral-400",
                )}
              >
                {isActive && (
                  <span className="absolute top-0 h-0.5 w-8 rounded-full bg-accent" aria-hidden="true" />
                )}
                <Icon className="h-5 w-5" aria-hidden="true" />
                {labels[tab.key]}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className="flex flex-col items-center gap-1 py-2.5 text-[11px] text-neutral-400"
          >
            <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
            {labels.more}
          </button>
        </div>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="start" className="w-72 sm:max-w-72">
          <SheetTitle>{labels.more}</SheetTitle>
          <div className="flex flex-col gap-1">
            <Link
              href="/account/addresses"
              onClick={() => setMoreOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-neutral-200 transition-colors hover:bg-white/5"
            >
              <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
              {labels.addresses}
            </Link>
            <Link
              href="/account/profile"
              onClick={() => setMoreOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-neutral-200 transition-colors hover:bg-white/5"
            >
              <User className="h-4 w-4 shrink-0" aria-hidden="true" />
              {labels.profile}
            </Link>
            {isAdmin && (
              <NextLink
                href="/admin"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-neutral-200 transition-colors hover:bg-white/5"
              >
                <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                {labels.adminPanel}
              </NextLink>
            )}
          </div>
          <div className="mt-2 border-t border-line-dark pt-4">
            <SignOutButton className="w-full justify-center" />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
