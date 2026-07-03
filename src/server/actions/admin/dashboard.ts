"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { db } from "@/lib/db";

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
