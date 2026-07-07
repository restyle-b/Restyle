const STORAGE_KEY = "restyle:recently-viewed";
const MAX_ITEMS = 10;

export type RecentlyViewedItem = {
  productId: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  priceAgorot: number;
  viewedAt: number;
};

/**
 * "נצפו לאחרונה" — localStorage בלבד, בכוונה (לא נשמר ב-DB, לא דורש התחברות,
 * ולא נחשף לשרת). ראה ux-spec.md §A2. פגום/ריק => מחזירים [] בשקט, לעולם לא זורקים.
 */
export function getRecentlyViewed(): RecentlyViewedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is RecentlyViewedItem =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as RecentlyViewedItem).productId === "string" &&
        typeof (item as RecentlyViewedItem).slug === "string",
    );
  } catch {
    return [];
  }
}

/** מוסיף/מזיז לראש הרשימה מוצר שנצפה כרגע; חותך ל-MAX_ITEMS. */
export function recordRecentlyViewed(item: Omit<RecentlyViewedItem, "viewedAt">): void {
  if (typeof window === "undefined") return;
  try {
    const current = getRecentlyViewed().filter((i) => i.productId !== item.productId);
    const next = [{ ...item, viewedAt: Date.now() }, ...current].slice(0, MAX_ITEMS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage לא זמין (מצב פרטי/מלא) — לא קריטי לפיצ'ר, פשוט לא נשמר.
  }
}
