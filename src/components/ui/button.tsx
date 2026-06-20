import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * צורת הכפתורים (pill מלא) ושני הצבעים המונוכרומטיים (שחור/לבן) מבוססים על
 * אפליקציית ReStyle (לא menspire) — ראה docs/DESIGN.md §כפתורים.
 * primary = pill שחור לרקעים בהירים; light = pill לבן לרקעים כהים (היפוך-קונטרסט).
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium tracking-wide transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:pointer-events-none disabled:opacity-50 disabled:hover:-translate-y-0 active:scale-[0.97]",
  {
    variants: {
      variant: {
        primary:
          "btn-shine bg-ink text-white shadow-sm hover:-translate-y-0.5 hover:bg-ink-soft hover:shadow-lg",
        light:
          "btn-shine bg-white text-ink shadow-sm hover:-translate-y-0.5 hover:bg-paper hover:shadow-lg",
        outline:
          "border border-current/30 text-current hover:-translate-y-0.5 hover:border-current hover:bg-current/10",
        ghost: "text-current hover:bg-current/10",
      },
      size: {
        sm: "h-9 px-4",
        md: "h-11 px-6",
        lg: "h-13 px-8 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = "Button";

export { buttonVariants };
