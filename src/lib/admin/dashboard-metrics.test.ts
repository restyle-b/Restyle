import { describe, it, expect } from "vitest";
import {
  addDays,
  bucketDailyRevenue,
  computeAov,
  computeDeltaPercent,
  startOfDay,
  summarizeRevenueWindows,
} from "@/lib/admin/dashboard-metrics";

const NOW = new Date("2026-07-04T12:00:00");

describe("computeDeltaPercent", () => {
  it("מחשב עלייה חיובית באחוזים", () => {
    expect(computeDeltaPercent(150, 100)).toBe(50);
  });

  it("מחשב ירידה שלילית באחוזים", () => {
    expect(computeDeltaPercent(50, 100)).toBe(-50);
  });

  it("מחזיר null כשאין תקופה קודמת להשוואה (0)", () => {
    expect(computeDeltaPercent(100, 0)).toBeNull();
    expect(computeDeltaPercent(0, 0)).toBeNull();
  });
});

describe("computeAov", () => {
  it("מחשב ממוצע הזמנה תקין", () => {
    expect(computeAov(30000, 3)).toBe(10000);
  });

  it("מחזיר null כשאין הזמנות (במקום NaN)", () => {
    expect(computeAov(0, 0)).toBeNull();
  });

  it("מעגל לאגורה שלמה", () => {
    expect(computeAov(100, 3)).toBe(33);
  });
});

describe("startOfDay / addDays", () => {
  it("מאפס שעות/דקות/שניות", () => {
    const d = startOfDay(new Date("2026-07-04T18:45:30"));
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
    expect(d.getDate()).toBe(4);
  });

  it("מזיז ימים קדימה ואחורה בלי לשנות את המקור", () => {
    const base = new Date("2026-07-04T00:00:00");
    const forward = addDays(base, 3);
    const backward = addDays(base, -3);
    expect(forward.getDate()).toBe(7);
    expect(backward.getDate()).toBe(1);
    expect(base.getDate()).toBe(4); // המקור לא השתנה
  });
});

describe("summarizeRevenueWindows", () => {
  const orders = [
    { createdAt: new Date("2026-07-04T09:00:00"), totalAgorot: 1000 }, // היום
    { createdAt: new Date("2026-07-03T09:00:00"), totalAgorot: 2000 }, // אתמול
    { createdAt: new Date("2026-06-29T09:00:00"), totalAgorot: 3000 }, // לפני 5 ימים — בתוך 7 האחרונים
    { createdAt: new Date("2026-06-20T09:00:00"), totalAgorot: 4000 }, // בתוך 30 האחרונים, מחוץ ל-7
    { createdAt: new Date("2026-06-10T09:00:00"), totalAgorot: 5000 }, // בתוך 30 האחרונים (גבול: 2026-06-05)
  ];

  it("משייך כל הזמנה לחלון הנכון (היום/7/30 יום)", () => {
    const summary = summarizeRevenueWindows(orders, NOW);
    expect(summary.today).toEqual({ revenueAgorot: 1000, orders: 1 });
    expect(summary.previousDay).toEqual({ revenueAgorot: 2000, orders: 1 });
    expect(summary.last7d.revenueAgorot).toBe(1000 + 2000 + 3000);
    expect(summary.last7d.orders).toBe(3);
    expect(summary.last30d.revenueAgorot).toBe(1000 + 2000 + 3000 + 4000 + 5000);
    expect(summary.last30d.orders).toBe(5);
  });

  it("לא כולל הזמנה מלפני 60 יום בשום חלון", () => {
    const oldOrder = [{ createdAt: new Date("2026-03-01T00:00:00"), totalAgorot: 9999 }];
    const summary = summarizeRevenueWindows(oldOrder, NOW);
    expect(summary.previous30d.orders).toBe(0);
  });

  it("מחזיר חלונות ריקים (0) כשאין הזמנות כלל", () => {
    const summary = summarizeRevenueWindows([], NOW);
    for (const window of Object.values(summary)) {
      expect(window).toEqual({ revenueAgorot: 0, orders: 0 });
    }
  });
});

describe("bucketDailyRevenue", () => {
  it("ממלא ימים ללא הזמנות באפס — לא מדלג עליהם", () => {
    const buckets = bucketDailyRevenue([], 5, NOW);
    expect(buckets).toHaveLength(5);
    expect(buckets.every((b) => b.revenueAgorot === 0)).toBe(true);
    expect(buckets.at(-1)?.dateKey).toBe("2026-07-04");
    expect(buckets.at(0)?.dateKey).toBe("2026-06-30");
  });

  it("מצרף כמה הזמנות מאותו יום לאותו דלי", () => {
    const orders = [
      { createdAt: new Date("2026-07-04T08:00:00"), totalAgorot: 1000 },
      { createdAt: new Date("2026-07-04T20:00:00"), totalAgorot: 2000 },
    ];
    const buckets = bucketDailyRevenue(orders, 3, NOW);
    const todayBucket = buckets.find((b) => b.dateKey === "2026-07-04");
    expect(todayBucket?.revenueAgorot).toBe(3000);
  });

  it("מתעלם מהזמנות מחוץ לטווח הימים המבוקש", () => {
    const orders = [{ createdAt: new Date("2026-01-01T00:00:00"), totalAgorot: 500 }];
    const buckets = bucketDailyRevenue(orders, 3, NOW);
    const total = buckets.reduce((sum, b) => sum + b.revenueAgorot, 0);
    expect(total).toBe(0);
  });
});
