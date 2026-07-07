"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { db } from "@/lib/db";
import { getLowStockThreshold } from "@/lib/admin/low-stock";
import { NON_REVENUE_ORDER_STATUSES } from "@/lib/admin/revenue-status";
import {
  bucketDailyRevenue,
  computeAov,
  computeDeltaPercent,
  addDays,
  startOfDay,
  summarizeRevenueWindows,
} from "@/lib/admin/dashboard-metrics";

export async function getDashboardStats() {
  await requireAdmin();

  const [
    courses,
    testimonials,
    galleryImages,
    products,
    categories,
    ordersByStatusRaw,
    enrollmentsByStatusRaw,
  ] = await Promise.all([
    db.course.count({ where: { active: true } }),
    db.testimonial.count({ where: { active: true } }),
    db.galleryImage.count({ where: { active: true } }),
    db.product.count({ where: { active: true } }),
    db.category.count({ where: { active: true } }),
    db.order.groupBy({ by: ["status"], _count: { _all: true } }),
    db.enrollment.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const ordersByStatus = Object.fromEntries(
    ordersByStatusRaw.map((row) => [row.status, row._count._all]),
  ) as Record<string, number>;
  const enrollmentsByStatus = Object.fromEntries(
    enrollmentsByStatusRaw.map((row) => [row.status, row._count._all]),
  ) as Record<string, number>;

  return {
    courses,
    testimonials,
    galleryImages,
    products,
    categories,
    ordersByStatus,
    enrollmentsByStatus,
    ordersTotal: ordersByStatusRaw.reduce((sum, row) => sum + row._count._all, 0),
    enrollmentsTotal: enrollmentsByStatusRaw.reduce((sum, row) => sum + row._count._all, 0),
    pendingOrders: ordersByStatus["PENDING"] ?? 0,
    pendingEnrollments: enrollmentsByStatus["PENDING"] ?? 0,
  };
}

/**
 * שאילתה קלה במיוחד ל-badge של ה-topbar — רק שני count() אינדקסיים, לא כל
 * מטען הדשבורד הכבד (הכנסות/טווחי זמן/top-products). נקראת בכל ניווט בין
 * מסכי האדמין (topbar.tsx), ולכן חייבת להישאר זולה.
 */
export async function getTopbarAlertCounts() {
  await requireAdmin();

  const lowStockThreshold = await getLowStockThreshold();
  const [pendingOrders, pendingEnrollments, lowStockProducts] = await Promise.all([
    db.order.count({ where: { status: "PENDING" } }),
    db.enrollment.count({ where: { status: "PENDING" } }),
    db.product.count({ where: { active: true, stock: { lte: lowStockThreshold } } }),
  ]);

  return { pendingOrders, pendingEnrollments, lowStockProducts };
}

export type TopProductRow = { id: string; nameHe: string; revenueAgorot: number };

/**
 * מטען כרטיסי ה-KPI + הגרפים בדשבורד הראשי (B1 ב-ux-spec) — הכנסות היום/7/30
 * יום עם דלתא מול התקופה הקודמת, מספר לקוחות, מלאי נמוך, הזמנות+AOV ל-30
 * יום, סדרת הכנסה יומית ל-30 יום (לגרף) ו-5 המוצרים המובילים בהכנסה.
 * כסף נשאר אגורות (Int) עד לרינדור — ההמרה לשקלים נעשית ב-formatAgorot ב-UI.
 */
export async function getDashboardOverview() {
  await requireAdmin();

  const now = new Date();
  const start60d = addDays(startOfDay(now), -59);

  const [ordersLast60d, customersCount, lowStockThreshold, topItemsRaw] = await Promise.all([
    db.order.findMany({
      where: { createdAt: { gte: start60d }, status: { notIn: NON_REVENUE_ORDER_STATUSES } },
      select: { createdAt: true, totalAgorot: true },
    }),
    db.user.count(),
    getLowStockThreshold(),
    db.orderItem.groupBy({
      by: ["productId"],
      where: {
        productId: { not: null },
        order: { createdAt: { gte: start60d }, status: { notIn: NON_REVENUE_ORDER_STATUSES } },
      },
      _sum: { lineTotalAgorot: true },
      orderBy: { _sum: { lineTotalAgorot: "desc" } },
      take: 5,
    }),
  ]);

  // stock<=סף כולל גם "אזל" (0) וגם "נמוך" — שתיהן דורשות תשומת לב בדשבורד.
  // הסף עצמו נקרא מ-SiteSettings (עם fallback) לפני השאילתה, לא קבוע קשיח.
  const lowStockCount = await db.product.count({
    where: { active: true, stock: { lte: lowStockThreshold } },
  });

  const revenue = summarizeRevenueWindows(ordersLast60d, now);
  const dailyRevenue30d = bucketDailyRevenue(
    ordersLast60d.filter((o) => o.createdAt >= addDays(startOfDay(now), -29)),
    30,
    now,
  );

  const aov30d = computeAov(revenue.last30d.revenueAgorot, revenue.last30d.orders);
  const aovPrev30d = computeAov(revenue.previous30d.revenueAgorot, revenue.previous30d.orders);

  const topProductIds = topItemsRaw.map((row) => row.productId).filter((id): id is string => !!id);
  const products =
    topProductIds.length > 0
      ? await db.product.findMany({ where: { id: { in: topProductIds } }, select: { id: true, nameHe: true } })
      : [];
  const productNameById = new Map(products.map((p) => [p.id, p.nameHe]));
  const topProducts: TopProductRow[] = topItemsRaw
    .filter((row): row is typeof row & { productId: string } => !!row.productId)
    .map((row) => ({
      id: row.productId,
      nameHe: productNameById.get(row.productId) ?? "מוצר שהוסר",
      revenueAgorot: row._sum.lineTotalAgorot ?? 0,
    }));

  return {
    customersCount,
    lowStockCount,
    revenue: {
      today: {
        agorot: revenue.today.revenueAgorot,
        deltaPercent: computeDeltaPercent(revenue.today.revenueAgorot, revenue.previousDay.revenueAgorot),
      },
      last7d: {
        agorot: revenue.last7d.revenueAgorot,
        deltaPercent: computeDeltaPercent(revenue.last7d.revenueAgorot, revenue.previous7d.revenueAgorot),
      },
      last30d: {
        agorot: revenue.last30d.revenueAgorot,
        deltaPercent: computeDeltaPercent(revenue.last30d.revenueAgorot, revenue.previous30d.revenueAgorot),
      },
    },
    orders30d: {
      count: revenue.last30d.orders,
      deltaPercent: computeDeltaPercent(revenue.last30d.orders, revenue.previous30d.orders),
    },
    aov30d: {
      agorot: aov30d,
      deltaPercent: aov30d !== null && aovPrev30d !== null ? computeDeltaPercent(aov30d, aovPrev30d) : null,
    },
    dailyRevenue30d,
    topProducts,
  };
}
