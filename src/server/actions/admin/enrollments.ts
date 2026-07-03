"use server";

import { revalidatePath } from "next/cache";
import type { EnrollmentStatus, Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth/require-admin";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/admin/activity-log";
import { ALLOWED_ENROLLMENT_TRANSITIONS } from "@/lib/admin/enrollment-status-transitions";
import { enrollmentStatusSchema } from "@/lib/admin/enrollment-status-schema";

export type AdminActionResult = { ok: true } | { ok: false; error: string };

const PAGE_SIZE = 25;

export async function listEnrollments(options?: {
  statusFilter?: EnrollmentStatus;
  search?: string;
  page?: number;
}) {
  await requireAdmin();

  const { statusFilter, search, page = 1 } = options ?? {};
  const trimmedSearch = search?.trim();

  const where: Prisma.EnrollmentWhereInput = {
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(trimmedSearch
      ? {
          OR: [
            { enrollmentNumber: { contains: trimmedSearch, mode: "insensitive" } },
            { customerName: { contains: trimmedSearch, mode: "insensitive" } },
            { customerEmail: { contains: trimmedSearch, mode: "insensitive" } },
            { customerPhone: { contains: trimmedSearch, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const currentPage = Math.max(1, page);
  const [enrollments, total] = await Promise.all([
    db.enrollment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        statusEvents: { orderBy: { createdAt: "desc" } },
        payments: { orderBy: { createdAt: "asc" } },
      },
    }),
    db.enrollment.count({ where }),
  ]);

  return { enrollments, total, page: currentPage, pageSize: PAGE_SIZE };
}

/** מדדים לכרטיסי הסיכום שבראש עמוד ההרשמות — לא תלויים בסינון הנוכחי. */
export async function getEnrollmentsOverview() {
  await requireAdmin();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [pendingCount, todayEnrollments, todayPaymentsAgg, overallAgg] = await Promise.all([
    db.enrollment.count({ where: { status: "PENDING" } }),
    db.enrollment.count({ where: { createdAt: { gte: startOfToday } } }),
    db.coursePayment.aggregate({
      where: { createdAt: { gte: startOfToday }, status: "SUCCEEDED" },
      _sum: { amountAgorot: true },
    }),
    db.enrollment.aggregate({
      where: { status: { notIn: ["CANCELLED", "FAILED"] } },
      _avg: { coursePriceAgorot: true },
    }),
  ]);

  return {
    pendingCount,
    todayEnrollments,
    todayRevenueAgorot: todayPaymentsAgg._sum.amountAgorot ?? 0,
    avgEnrollmentAgorot: Math.round(overallAgg._avg.coursePriceAgorot ?? 0),
  };
}

export async function getEnrollment(enrollmentNumber: string) {
  await requireAdmin();
  return db.enrollment.findUnique({
    where: { enrollmentNumber },
    include: {
      payments: { orderBy: { createdAt: "asc" } },
      user: { select: { email: true } },
      statusEvents: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function updateEnrollmentStatus(
  enrollmentNumber: string,
  newStatusInput: EnrollmentStatus,
): Promise<AdminActionResult> {
  const admin = await requireAdmin();

  const parsed = enrollmentStatusSchema.safeParse(newStatusInput);
  if (!parsed.success) {
    return { ok: false, error: "סטטוס לא תקין" };
  }
  const newStatus = parsed.data;

  const enrollment = await db.enrollment.findUnique({
    where: { enrollmentNumber },
    select: { id: true, status: true },
  });
  if (!enrollment) {
    return { ok: false, error: "הרשמה לא נמצאה" };
  }

  const allowed = ALLOWED_ENROLLMENT_TRANSITIONS[enrollment.status];
  if (!allowed.includes(newStatus)) {
    return { ok: false, error: `מעבר מ-${enrollment.status} ל-${newStatus} אינו מותר` };
  }

  await db.$transaction([
    db.enrollment.update({ where: { enrollmentNumber }, data: { status: newStatus } }),
    db.enrollmentStatusEvent.create({
      data: {
        enrollmentId: enrollment.id,
        fromStatus: enrollment.status,
        toStatus: newStatus,
        changedBy: admin.email,
      },
    }),
  ]);

  await logActivity({
    actorEmail: admin.email,
    action: "enrollment.status_change",
    entityType: "enrollment",
    entityId: enrollment.id,
    summary: `הרשמה ${enrollmentNumber}: ${enrollment.status} → ${newStatus}`,
  });

  revalidatePath("/admin/enrollments");
  revalidatePath(`/admin/enrollments/${enrollmentNumber}`);
  return { ok: true };
}
