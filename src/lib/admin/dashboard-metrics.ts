/**
 * חישובים טהורים (ללא DB) לדשבורד האדמין — חלוקה לדליים לפי יום, סיכומי טווחי
 * זמן (עם תקופה קודמת להשוואה) ואחוז שינוי. מופרד מ-server/actions/admin/dashboard.ts
 * כדי שיהיה ניתן לבדוק ב-vitest בלי DB אמיתי.
 */

export type RevenueWindow = { revenueAgorot: number; orders: number };

export type RevenueWindowSummary = {
  today: RevenueWindow;
  previousDay: RevenueWindow;
  last7d: RevenueWindow;
  previous7d: RevenueWindow;
  last30d: RevenueWindow;
  previous30d: RevenueWindow;
};

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * מסכם הכנסה+מספר הזמנות לחלונות זמן קבועים (היום/7/30 יום) + התקופה הקבילה
 * שלפני כל חלון (לצורך דלתא). מקבל את כל ההזמנות מ-60 הימים האחרונים פעם
 * אחת ומחשב הכול ב-JS — נמנע מ-6 שאילתות DB נפרדות.
 */
export function summarizeRevenueWindows(
  orders: { createdAt: Date; totalAgorot: number }[],
  now: Date = new Date(),
): RevenueWindowSummary {
  const today0 = startOfDay(now);
  const tomorrow0 = addDays(today0, 1);

  const bounds = {
    today: [today0, tomorrow0],
    previousDay: [addDays(today0, -1), today0],
    last7d: [addDays(today0, -6), tomorrow0],
    previous7d: [addDays(today0, -13), addDays(today0, -6)],
    last30d: [addDays(today0, -29), tomorrow0],
    previous30d: [addDays(today0, -59), addDays(today0, -29)],
  } as const satisfies Record<keyof RevenueWindowSummary, readonly [Date, Date]>;

  const summary = {} as RevenueWindowSummary;
  for (const key of Object.keys(bounds) as (keyof RevenueWindowSummary)[]) {
    const [start, end] = bounds[key];
    let revenueAgorot = 0;
    let count = 0;
    for (const order of orders) {
      if (order.createdAt >= start && order.createdAt < end) {
        revenueAgorot += order.totalAgorot;
        count += 1;
      }
    }
    summary[key] = { revenueAgorot, orders: count };
  }
  return summary;
}

/** אחוז שינוי בין תקופה נוכחית לקודמת. null כשאין בסיס להשוואה (תקופה קודמת = 0). */
export function computeDeltaPercent(current: number, previous: number): number | null {
  if (!previous) return null;
  return Math.round(((current - previous) / previous) * 100);
}

/** ממוצע הזמנה (AOV) באגורות. null כשאין הזמנות בתקופה — מוצג "—" ולא NaN. */
export function computeAov(revenueAgorot: number, orders: number): number | null {
  if (!orders) return null;
  return Math.round(revenueAgorot / orders);
}

export type DailyRevenuePoint = { dateKey: string; revenueAgorot: number };

function toDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * מחלק הזמנות לדליים יומיים לאורך `days` הימים האחרונים (כולל היום), עם 0
 * לימים ללא הזמנות — הגרף חייב ציר-X רציף, לא לדלג על ימים ריקים.
 */
export function bucketDailyRevenue(
  orders: { createdAt: Date; totalAgorot: number }[],
  days: number,
  now: Date = new Date(),
): DailyRevenuePoint[] {
  const today0 = startOfDay(now);
  const sums = new Map<string, number>();
  const buckets: DailyRevenuePoint[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const key = toDateKey(addDays(today0, -i));
    sums.set(key, 0);
    buckets.push({ dateKey: key, revenueAgorot: 0 });
  }

  for (const order of orders) {
    const key = toDateKey(order.createdAt);
    if (sums.has(key)) {
      sums.set(key, (sums.get(key) ?? 0) + order.totalAgorot);
    }
  }

  return buckets.map((b) => ({ ...b, revenueAgorot: sums.get(b.dateKey) ?? 0 }));
}
