import Link from "next/link";
import { Scissors } from "lucide-react";
import { SidebarNav } from "@/components/admin/sidebar-nav";

/** סיידבר קבוע — דסקטופ בלבד (md+); בנייד מוחלף ב-MobileNav (Sheet). */
export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-e border-line-dark bg-ink-soft/60 md:flex">
      <Link href="/admin" className="flex items-center gap-2 border-b border-line-dark px-5 py-5">
        <Scissors className="h-5 w-5 text-accent" aria-hidden="true" />
        <span className="font-display text-sm font-bold tracking-wide text-white uppercase">
          ReStyle ניהול
        </span>
      </Link>
      <SidebarNav />
    </aside>
  );
}
