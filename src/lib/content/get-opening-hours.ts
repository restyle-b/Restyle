import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";

export const OPENING_HOURS_TAG = "opening-hours";

const CLOSED_LABEL: Record<string, string> = { he: "סגור", en: "Closed", ar: "مغلق" };

export type OpeningHourRow = {
  dayOrder: number;
  closed: boolean;
  openTime: string | null;
  closeTime: string | null;
};
export type OpeningHourDisplayRow = { day: string; hours: string };

/** שם יום מלא לפי locale, נגזר מ-dayOrder (לא מאוחסן ב-DB). מסיר קידומת "יום " בעברית לשמירה על הסגנון הקיים ("ראשון" ולא "יום ראשון"). */
function weekdayLabel(dayOrder: number, locale: string): string {
  // 2023-01-01 הוא יום ראשון — נקודת ייחוס קבועה, לא תלוית שנה נוכחית.
  const ref = new Date(2023, 0, 1 + dayOrder);
  const label = new Intl.DateTimeFormat(locale, { weekday: "long" }).format(ref);
  return locale === "he" ? label.replace(/^יום /, "") : label;
}

function formatRange(open: string | null, close: string | null): string {
  return open && close ? `${open}–${close}` : "";
}

/** מאגד ימים רצופים עם אותן שעות בדיוק לשורת תצוגה אחת (למשל "ראשון–חמישי"), נגזר מהנתונים — לא hardcoded. */
function groupConsecutive(rows: OpeningHourRow[], locale: string): OpeningHourDisplayRow[] {
  const groups: {
    start: number;
    end: number;
    closed: boolean;
    openTime: string | null;
    closeTime: string | null;
  }[] = [];
  for (const row of rows) {
    const last = groups.at(-1);
    if (
      last &&
      last.closed === row.closed &&
      last.openTime === row.openTime &&
      last.closeTime === row.closeTime &&
      last.end === row.dayOrder - 1
    ) {
      last.end = row.dayOrder;
    } else {
      groups.push({ start: row.dayOrder, end: row.dayOrder, closed: row.closed, openTime: row.openTime, closeTime: row.closeTime });
    }
  }
  return groups.map((g) => ({
    day: g.start === g.end ? weekdayLabel(g.start, locale) : `${weekdayLabel(g.start, locale)}–${weekdayLabel(g.end, locale)}`,
    hours: g.closed ? (CLOSED_LABEL[locale] ?? "סגור") : formatRange(g.openTime, g.closeTime),
  }));
}

async function fetchOpeningHours(): Promise<OpeningHourRow[]> {
  try {
    return await db.openingHour.findMany({ orderBy: { dayOrder: "asc" } });
  } catch (err) {
    console.error("[content] failed to load opening hours:", err);
    return [];
  }
}

const cachedFetchOpeningHours = unstable_cache(fetchOpeningHours, ["opening-hours-list"], {
  tags: [OPENING_HOURS_TAG],
  revalidate: 300,
});

/** שורות גולמיות (dayOrder/closed/openTime/closeTime) — לשימוש ע"י OpenNowBadge (בדיקת "פתוח עכשיו" חיה). */
export async function getOpeningHourRows(): Promise<OpeningHourRow[]> {
  return cachedFetchOpeningHours();
}

/**
 * שורות מפורמטות לתצוגה ב-locale נתון — לשימוש ב-locations/page.tsx
 * ובדף הבית. נופל חזרה ל-messages/*.json "hours" רק אם ה-DB ריק/לא נגיש.
 */
export async function getOpeningHours(locale: string): Promise<OpeningHourDisplayRow[]> {
  const rows = await cachedFetchOpeningHours();
  if (rows.length === 7) return groupConsecutive(rows, locale);

  const messages = (await import(`../../../messages/${locale}.json`)).default;
  return messages.hours as OpeningHourDisplayRow[];
}
