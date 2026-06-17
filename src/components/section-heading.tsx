import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  light,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  /** true כשהסקציה על רקע כהה (טקסט בהיר) */
  light?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {eyebrow && (
        <p
          className={cn(
            "font-display text-sm uppercase tracking-[0.3em]",
            light ? "text-[--color-accent]" : "text-[--color-accent-soft]",
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          "font-display mt-3 text-3xl font-bold sm:text-4xl",
          light ? "text-white" : "text-[--color-ink]",
        )}
      >
        {title}
      </h2>
      {description && (
        <p className={cn("mt-4 text-base", light ? "text-neutral-300" : "text-neutral-600")}>
          {description}
        </p>
      )}
    </div>
  );
}
