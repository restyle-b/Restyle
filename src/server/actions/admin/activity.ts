"use server";

import type { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth/require-admin";
import { db } from "@/lib/db";

const PAGE_SIZE = 30;

export async function listActivity(options?: {
  entityType?: string;
  search?: string;
  page?: number;
  /** דורס את גודל העמוד — משמש להטמעת "פעילות אחרונה" מצומצמת בדשבורד (limit=5). */
  limit?: number;
}) {
  await requireAdmin();

  const { entityType, search, page = 1, limit } = options ?? {};
  const trimmedSearch = search?.trim();
  const pageSize = limit ?? PAGE_SIZE;

  const where: Prisma.ActivityLogWhereInput = {
    ...(entityType ? { entityType } : {}),
    ...(trimmedSearch
      ? {
          OR: [
            { summary: { contains: trimmedSearch, mode: "insensitive" } },
            { actorEmail: { contains: trimmedSearch, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const currentPage = Math.max(1, page);
  const [events, total, entityTypeRows] = await Promise.all([
    db.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    }),
    db.activityLog.count({ where }),
    db.activityLog.findMany({ distinct: ["entityType"], select: { entityType: true }, orderBy: { entityType: "asc" } }),
  ]);

  return {
    events,
    total,
    page: currentPage,
    pageSize,
    entityTypes: entityTypeRows.map((r) => r.entityType),
  };
}
