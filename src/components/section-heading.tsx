import { cn } from "@/lib/utils";
import { CutHeading } from "@/components/cut-heading";

export function SectionHeading({
  eyebrow,
  title,
  description,
  light,
  center,
  cut,
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
  className?: string;
}) {
  const titleClass = cn(
    "font-display mt-3 text-3xl font-bold sm:text-4xl",
    light ? "text-white" : "text-ink",
  );
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
        <CutHeading title={title} className={titleClass} />
      ) : (
        <h2 className={titleClass}>{title}</h2>
      )}
      {description && (
        <p className={cn("mt-4 text-base", light ? "text-neutral-300" : "text-neutral-600")}>
          {description}
        </p>
      )}
    </div>
  );
}
