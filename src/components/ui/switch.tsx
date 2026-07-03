"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

/**
 * האדמין נעול RTL (dir="rtl" קשיח, לא תלוי locale) — לכן ה"מנוחה" ממוקמת
 * ב-ps-0.5 (מתחיל מימין תחת RTL) וה"דלוק" זז שמאלה (translateX שלילי, פיזי
 * ולא לוגי בכוונה: הקומפוננטה הזו לעולם לא מרונדרת בעץ LTR).
 */
export function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent ps-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-accent data-[state=unchecked]:bg-white/15",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-ink shadow-sm transition-transform",
          "data-[state=checked]:-translate-x-4 data-[state=unchecked]:translate-x-0",
        )}
      />
    </SwitchPrimitive.Root>
  );
}
