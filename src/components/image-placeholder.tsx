import { cn } from "@/lib/utils";

/**
 * placeholder עד לקבלת תמונות אמיתיות (ראה docs/DESIGN.md).
 * להחליף ב-next/image כשתמונות יתקבלו (לשמר את שכבת ה-group-hover zoom).
 */
export function ImagePlaceholder({ label, className }: { label: string; className?: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn("group relative overflow-hidden bg-ink", className)}
    >
      {/* שכבת הרקע — זום איטי (Ken Burns) ב-hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-ink-soft to-ink transition-transform duration-[1200ms] ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
      {/* הבהרה עדינה של ה-accent ב-hover */}
      <div className="absolute inset-0 bg-accent/0 transition-colors duration-500 group-hover:bg-accent/5 motion-reduce:transition-none" />
      <span className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-neutral-500">
        {label}
      </span>
    </div>
  );
}
