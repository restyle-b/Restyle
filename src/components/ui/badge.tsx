import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium tracking-wide whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral: "bg-white/10 text-neutral-200",
        success: "bg-green-900/60 text-green-200",
        warning: "bg-yellow-900/60 text-yellow-200",
        danger: "bg-red-900/60 text-red-200",
        info: "bg-blue-900/60 text-blue-200",
        purple: "bg-purple-900/60 text-purple-200",
        accent: "bg-accent text-ink",
        outline: "border border-line-dark text-neutral-300",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

/** תג סטטוס/מצב — משמש ל-order/payment/enrollment status, בריאות מלאי, featured וכו'. */
export function Badge({ className, tone, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...props}>
      {dot && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}

export { badgeVariants };
