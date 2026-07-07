"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export function TooltipContent({
  className,
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "z-50 rounded-md border border-line-dark bg-ink-soft px-2.5 py-1.5 text-xs text-neutral-200 shadow-md",
          "data-[state=delayed-open]:animate-[overlay-in_var(--dur-micro)_var(--ease-out)_both]",
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}
