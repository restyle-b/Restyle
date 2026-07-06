"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  Ticket,
  ShoppingCart,
  GraduationCap,
  BookOpen,
  Quote,
  Images,
  FileText,
  Settings,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_GROUPS = [
  {
    label: "כללי",
    links: [{ href: "/admin", label: "דשבורד", icon: LayoutDashboard }],
  },
  {
    label: "קטלוג",
    links: [
      { href: "/admin/products", label: "מוצרים", icon: Package },
      { href: "/admin/categories", label: "קטגוריות", icon: Tags },
    ],
  },
  {
    label: "שיווק",
    links: [{ href: "/admin/promotions", label: "מבצעים וקופונים", icon: Ticket }],
  },
  {
    label: "עסקאות",
    links: [
      { href: "/admin/orders", label: "הזמנות", icon: ShoppingCart },
      { href: "/admin/enrollments", label: "הרשמות לקורסים", icon: GraduationCap },
    ],
  },
  {
    label: "תוכן האתר",
    links: [
      { href: "/admin/courses", label: "קורסים", icon: BookOpen },
      { href: "/admin/testimonials", label: "המלצות", icon: Quote },
      { href: "/admin/gallery", label: "גלריה", icon: Images },
      { href: "/admin/content", label: "טקסטי האתר", icon: FileText },
      { href: "/admin/settings", label: "הגדרות אתר", icon: Settings },
    ],
  },
  {
    label: "מעקב",
    links: [{ href: "/admin/activity", label: "היסטוריית פעילות", icon: History }],
  },
] as const;

/** תוכן הניווט — משותף בין הסיידבר הקבוע (דסקטופ) לגיליון הנייד. */
export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-6">
      {NAV_GROUPS.map((group) => (
        <div key={group.label} className="flex flex-col gap-1">
          <span className="px-3 text-[11px] font-medium tracking-wider text-neutral-500 uppercase">
            {group.label}
          </span>
          {group.links.map((link) => {
            const isActive = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onNavigate}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-white/10 font-medium text-white"
                    : "text-neutral-400 hover:bg-white/5 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {link.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
