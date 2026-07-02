"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { EnrollmentStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth/require-admin";
import { db } from "@/lib/db";
import { ALLOWED_ENROLLMENT_TRANSITIONS } from "@/lib/admin/enrollment-status-transitions";

export type AdminActionResult = { ok: true } | { ok: false; error: string };

const enrollmentStatusSchema = z.enum(["PENDING", "DEPOSIT_PAID", "PAID", "CANCELLED", "FAILED"]);

export async function listEnrollments(statusFilter?: EnrollmentStatus) {
  await requireAdmin();
  return db.enrollment.findMany({
    where: statusFilter ? { status: statusFilter } : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function getEnrollment(enrollmentNumber: string) {
  await requireAdmin();
  return db.enrollment.findUnique({
    where: { enrollmentNumber },
    include: { payments: { orderBy: { createdAt: "asc" } }, user: { select: { email: true } } },
  });
}

export async function updateEnrollmentStatus(
  enrollmentNumber: string,
  newStatusInput: EnrollmentStatus,
): Promise<AdminActionResult> {
  await requireAdmin();

  const parsed = enrollmentStatusSchema.safeParse(newStatusInput);
  if (!parsed.success) {
    return { ok: false, error: "סטטוס לא תקין" };
  }
  const newStatus = parsed.data;

  const enrollment = await db.enrollment.findUnique({
    where: { enrollmentNumber },
    select: { status: true },
  });
  if (!enrollment) {
    return { ok: false, error: "הרשמה לא נמצאה" };
  }

  const allowed = ALLOWED_ENROLLMENT_TRANSITIONS[enrollment.status];
  if (!allowed.includes(newStatus)) {
    return { ok: false, error: `מעבר מ-${enrollment.status} ל-${newStatus} אינו מותר` };
  }

  await db.enrollment.update({ where: { enrollmentNumber }, data: { status: newStatus } });
  revalidatePath("/admin/enrollments");
  revalidatePath(`/admin/enrollments/${enrollmentNumber}`);
  return { ok: true };
}
