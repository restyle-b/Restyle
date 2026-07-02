import { cn } from "@/lib/utils";
import { CutHeading } from "@/components/cut-heading";

export function SectionHeading({
  eyebrow,
  title,
  description,
  light,
  center,
  cut,
  as = "h2",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  /** true כשהסקציה על רקע כהה (טקסט בהיר) */
  light?: boolean;
  /** true למרכוז הכותרת (בהשראת בלוקים מלאי-רוחב ב-menspire.com) */
  center?: boolean;
  /** true לחשיפת "גזירה" של הכותרת בכניסה לצפייה (מוטיב המספריים) */
  cut?: boolean;
  /** רמת הכותרת הסמנטית — h1 כשזו הכותרת היחידה בעמוד (WCAG SC 1.3.1), אחרת h2 (ברירת מחדל) */
  as?: "h1" | "h2";
  className?: string;
}) {
  const titleClass = cn(
    "font-display mt-3 text-3xl font-bold sm:text-4xl",
    light ? "text-white" : "text-ink",
  );
  const HeadingTag = as;
  return (
    <div className={cn("max-w-2xl", center && "mx-auto text-center", className)}>
      {eyebrow && (
        <p
          className={cn(
            "font-display text-sm uppercase tracking-[0.3em]",
            light ? "text-accent" : "text-accent-soft",
          )}
        >
          {eyebrow}
        </p>
      )}
      {cut ? (
        <CutHeading title={title} className={titleClass} as={as} />
      ) : (
        <HeadingTag className={titleClass}>{title}</HeadingTag>
      )}
      {description && (
        <p className={cn("mt-4 text-base", light ? "text-neutral-300" : "text-neutral-600")}>
          {description}
        </p>
      )}
    </div>
  );
}
