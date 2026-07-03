"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { db } from "@/lib/db";

export async function getDashboardStats() {
  await requireAdmin();

  const [courses, testimonials, galleryImages, products, categories, pendingOrders, pendingEnrollments] =
    await Promise.all([
      db.course.count({ where: { active: true } }),
      db.testimonial.count({ where: { active: true } }),
      db.galleryImage.count({ where: { active: true } }),
      db.product.count({ where: { active: true } }),
      db.category.count({ where: { active: true } }),
      db.order.count({ where: { status: "PENDING" } }),
      db.enrollment.count({ where: { status: "PENDING" } }),
    ]);

  return { courses, testimonials, galleryImages, products, categories, pendingOrders, pendingEnrollments };
}
