"use client";

import { Toaster as Sonner } from "sonner";

/** מיכל ה-toast הגלובלי לאדמין — מציג הצלחה/כשל אחרי כל פעולת שרת (inline edit, מחיקה וכו'). */
export function Toaster() {
  return (
    <Sonner
      theme="dark"
      position="top-center"
      dir="rtl"
      toastOptions={{
        classNames: {
          toast: "!bg-ink-soft !border !border-line-dark !text-white !shadow-lg",
          description: "!text-neutral-400",
          success: "!text-green-300",
          error: "!text-red-300",
        },
      }}
    />
  );
}
