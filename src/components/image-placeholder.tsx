import { cn } from "@/lib/utils";

/**
 * placeholder עד לקבלת תמונות אמיתיות (ראה docs/DESIGN.md).
 * להחליף ב-next/image כשתמונות יתקבלו.
 */
export function ImagePlaceholder({ label, className }: { label: string; className?: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "flex items-center justify-center bg-gradient-to-br from-[--color-ink-soft] to-[--color-ink] text-center",
        className,
      )}
    >
      <span className="px-6 text-sm text-neutral-500">{label}</span>
    </div>
  );
}
