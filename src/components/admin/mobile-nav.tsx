"use client";

import { useState } from "react";
import { Menu, Scissors } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { SidebarNav } from "@/components/admin/sidebar-nav";

/** ניווט לנייד — כפתור המבורגר שפותח את הניווט כגיליון (Sheet) מהצד שבו יושב הסיידבר. */
export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-300 transition-colors hover:bg-white/10 hover:text-white md:hidden"
        aria-label="פתיחת ניווט"
      >
        <Menu className="h-5 w-5" />
      </button>
      <SheetContent side="start" className="w-72 gap-0 p-0 sm:max-w-72">
        <SheetTitle className="sr-only">ניווט ניהול</SheetTitle>
        <div className="flex items-center gap-2 border-b border-line-dark px-5 py-5">
          <Scissors className="h-5 w-5 text-accent" aria-hidden="true" />
          <span className="font-display text-sm font-bold tracking-wide text-white uppercase">
            ReStyle ניהול
          </span>
        </div>
        <SidebarNav onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
