import { cn } from "@/lib/utils";

/**
 * שלד טעינה לכרטיסי הדשבורד — כל כרטיס עוטף ה-Suspense שלו (streaming עצמאי,
 * לא חוסם כרטיסים אחרים). מכבד prefers-reduced-motion (motion-reduce:animate-none).
 */
export function DashboardCardSkeleton({ className, rows = 3 }: { className?: string; rows?: number }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl border border-line-dark bg-ink-soft/60 p-5 motion-reduce:animate-none",
        className,
      )}
      aria-hidden="true"
    >
      <div className="h-4 w-32 rounded bg-white/5" />
      <div className="mt-5 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-12 rounded-lg bg-white/5" />
        ))}
      </div>
    </div>
  );
}
