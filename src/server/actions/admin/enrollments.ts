"use server";

import { revalidatePath } from "next/cache";
import type { EnrollmentStatus, Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth/require-admin";
import { db } from "@/lib/db";
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
    }),
    db.enrollment.count({ where }),
  ]);

  return { enrollments, total, page: currentPage, pageSize: PAGE_SIZE };
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
  revalidatePath("/admin/enrollments");
  revalidatePath(`/admin/enrollments/${enrollmentNumber}`);
  return { ok: true };
}
