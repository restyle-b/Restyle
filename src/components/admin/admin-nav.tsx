"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_GROUPS = [
  {
    label: "כללי",
    links: [
      { href: "/admin", label: "דשבורד" },
      { href: "/admin/settings", label: "הגדרות אתר" },
    ],
  },
  {
    label: "אתר ותוכן",
    links: [
      { href: "/admin/courses", label: "קורסים" },
      { href: "/admin/testimonials", label: "המלצות" },
      { href: "/admin/gallery", label: "גלריה" },
      { href: "/admin/content", label: "טקסטי האתר" },
    ],
  },
  {
    label: "קטלוג",
    links: [
      { href: "/admin/products", label: "מוצרים" },
      { href: "/admin/categories", label: "קטגוריות" },
    ],
  },
  {
    label: "עסקאות",
    links: [
      { href: "/admin/orders", label: "הזמנות" },
      { href: "/admin/enrollments", label: "הרשמות לקורסים" },
    ],
  },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-x-8 gap-y-3">
      {NAV_GROUPS.map((group, i) => (
        <div
          key={group.label}
          className={cn(
            "flex flex-wrap items-center gap-x-4 gap-y-1",
            i > 0 && "border-line-dark ps-8 border-s",
          )}
        >
          <span className="text-[11px] tracking-wide text-neutral-500 uppercase">{group.label}</span>
          {group.links.map((link) => {
            const isActive = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "text-sm transition-colors hover:text-white",
                  isActive ? "text-accent font-semibold" : "text-neutral-300",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
