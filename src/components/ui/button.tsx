import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium tracking-wide transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:pointer-events-none disabled:opacity-50 disabled:hover:-translate-y-0 active:scale-[0.97]",
  {
    variants: {
      variant: {
        primary:
          "bg-concrete font-bold text-white [text-shadow:0_1px_3px_rgb(0_0_0_/_0.6)] shadow-sm hover:-translate-y-0.5 hover:shadow-lg",
        light: "bg-paper text-ink shadow-sm hover:-translate-y-0.5 hover:bg-white hover:shadow-lg",
        outline:
          "border border-line-light/40 text-paper hover:-translate-y-0.5 hover:border-accent hover:bg-paper/10",
        ghost: "text-paper hover:bg-paper/10",
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
