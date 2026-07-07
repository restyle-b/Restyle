"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;
export const SheetPortal = DialogPrimitive.Portal;

function SheetOverlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="overlay"
      className={cn("fixed inset-0 z-50 bg-black/70", className)}
      {...props}
    />
  );
}

/**
 * פאנל צד — האדמין נעול RTL (dir="rtl" קשיח), לכן "side" הוא לוגי-סמנטי:
 * "end" (ברירת מחדל) = פותח משמאל, ל-drawers של פרטים (מוצר/הזמנה וכו').
 * "start" = פותח מימין (איפה שיושב ה-sidebar), לתפריט הנייד בלבד.
 */
export function SheetContent({
  className,
  children,
  side = "end",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & { side?: "start" | "end" }) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Content
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "fixed inset-y-0 z-50 flex h-full w-full flex-col gap-4 border-line-dark bg-ink-soft p-6 shadow-lg sm:max-w-md",
          side === "end" ? "left-0 border-e" : "right-0 border-s",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute end-4 top-4 rounded-md text-neutral-500 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
          <X className="h-4 w-4" />
          <span className="sr-only">סגירה</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </SheetPortal>
  );
}

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1 text-start", className)} {...props} />;
}

export function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-auto flex flex-col gap-2 pt-4", className)} {...props} />;
}

export function SheetTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn("text-lg font-semibold text-white", className)} {...props} />;
}

export function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cn("text-sm text-neutral-400", className)} {...props} />;
}
