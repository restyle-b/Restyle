import type { Metadata } from "next";
import Link from "next/link";
import { listActivity } from "@/server/actions/admin/activity";
import { ActivityTimeline } from "@/components/admin/activity/activity-timeline";
import { Pagination } from "@/components/admin/pagination";
import { adminInputClass } from "@/lib/admin/form-styles";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "היסטוריית פעילות | ניהול" };
export const dynamic = "force-dynamic";

const ENTITY_TYPE_LABELS: Record<string, string> = {
  product: "מוצרים",
  order: "הזמנות",
  enrollment: "הרשמות לקורסים",
  course: "קורסים",
  testimonial: "המלצות",
  gallery: "גלריה",
  content: "טקסטי אתר",
  settings: "הגדרות אתר",
  category: "קטגוריות",
};

export default async function AdminActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string; page?: string }>;
}) {
  const { type, q, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const { events, total, pageSize, entityTypes } = await listActivity({ entityType: type, search: q, page });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">היסטוריית פעילות</h1>
      <p className="mt-1 text-sm text-neutral-400">
        {total} פעולות בסינון הנוכחי — עדכוני מוצרים ומלאי, הזמנות, הרשמות לקורסים ופעולות ניהול נוספות.
      </p>

      <form method="get" className="mt-6 flex flex-wrap items-center gap-2">
        {type && <input type="hidden" name="type" value={type} />}
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="חיפוש: תיאור הפעולה או מבצע הפעולה"
          className={cn(adminInputClass, "max-w-xs")}
        />
        <button type="submit" className="rounded-md border border-line-dark px-4 py-2 text-sm hover:border-accent">
          חיפוש
        </button>
        {q && (
          <Link href={type ? `/admin/activity?type=${type}` : "/admin/activity"} className="text-sm text-neutral-400 hover:text-white">
            נקה חיפוש
          </Link>
        )}
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={q ? `/admin/activity?q=${encodeURIComponent(q)}` : "/admin/activity"}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm transition-colors",
            !type ? "border-accent bg-accent text-ink" : "border-line-dark text-neutral-300 hover:bg-ink-soft",
          )}
        >
          הכל
        </Link>
        {entityTypes.map((et) => (
          <Link
            key={et}
            href={`/admin/activity?type=${et}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition-colors",
              type === et ? "border-accent bg-accent text-ink" : "border-line-dark text-neutral-300 hover:bg-ink-soft",
            )}
          >
            {ENTITY_TYPE_LABELS[et] ?? et}
          </Link>
        ))}
      </div>

      <ActivityTimeline events={events} />

      <Pagination basePath="/admin/activity" params={{ type, q }} page={page} pageSize={pageSize} total={total} />
    </div>
  );
}
