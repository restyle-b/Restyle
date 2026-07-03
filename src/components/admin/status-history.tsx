/** מציג את מקור השינוי בעברית — "payment"/"system" פנימיים, אחרת אימייל אדמין. */
function changedByLabel(changedBy: string | null): string {
  if (changedBy === "payment") return "תשלום (אוטומטי)";
  if (!changedBy || changedBy === "system") return "מערכת";
  return changedBy;
}

export type StatusEventRow = {
  id: string;
  toStatus: string;
  changedBy: string | null;
  createdAt: Date;
};

/** ציר-זמן היסטוריית סטטוס (הזמנה/הרשמה) — מהחדש לישן. */
export function StatusHistory({
  events,
  labels,
}: {
  events: StatusEventRow[];
  labels: Record<string, string>;
}) {
  if (events.length === 0) {
    return <p className="text-sm text-neutral-400">אין היסטוריית סטטוס (הזמנות מלפני הוספת המעקב).</p>;
  }

  return (
    <ol className="space-y-2">
      {events.map((event) => (
        <li key={event.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
          <span className="text-neutral-500 [direction:ltr] [font-variant-numeric:tabular-nums]">
            {new Date(event.createdAt).toLocaleString("he-IL", { dateStyle: "short", timeStyle: "short" })}
          </span>
          <span className="font-medium text-white">{labels[event.toStatus] ?? event.toStatus}</span>
          <span className="text-neutral-400">· {changedByLabel(event.changedBy)}</span>
        </li>
      ))}
    </ol>
  );
}
