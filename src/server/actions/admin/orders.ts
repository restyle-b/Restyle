"use server";

import { revalidatePath } from "next/cache";
import type { OrderStatus, Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth/require-admin";
import { db } from "@/lib/db";
import { ALLOWED_ORDER_TRANSITIONS } from "@/lib/admin/order-status-transitions";
import { orderStatusSchema } from "@/lib/admin/order-status-schema";

export type AdminActionResult = { ok: true } | { ok: false; error: string };

const PAGE_SIZE = 25;

export async function listOrders(options?: { statusFilter?: OrderStatus; search?: string; page?: number }) {
  await requireAdmin();

  const { statusFilter, search, page = 1 } = options ?? {};
  const trimmedSearch = search?.trim();

  const where: Prisma.OrderWhereInput = {
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(trimmedSearch
      ? {
          OR: [
            { orderNumber: { contains: trimmedSearch, mode: "insensitive" } },
            { customerName: { contains: trimmedSearch, mode: "insensitive" } },
            { customerEmail: { contains: trimmedSearch, mode: "insensitive" } },
            { customerPhone: { contains: trimmedSearch, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const currentPage = Math.max(1, page);
  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { payment: true },
    }),
    db.order.count({ where }),
  ]);

  return { orders, total, page: currentPage, pageSize: PAGE_SIZE };
}

export async function getOrder(orderNumber: string) {
  await requireAdmin();
  return db.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
      payment: true,
      user: { select: { email: true } },
      statusEvents: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function updateOrderStatus(
  orderNumber: string,
  newStatusInput: OrderStatus,
): Promise<AdminActionResult> {
  const admin = await requireAdmin();

  const parsedStatus = orderStatusSchema.safeParse(newStatusInput);
  if (!parsedStatus.success) {
    return { ok: false, error: "סטטוס לא תקין" };
  }
  const newStatus = parsedStatus.data;

  const order = await db.order.findUnique({ where: { orderNumber }, select: { id: true, status: true } });
  if (!order) {
    return { ok: false, error: "הזמנה לא נמצאה" };
  }

  const allowed = ALLOWED_ORDER_TRANSITIONS[order.status];
  if (!allowed.includes(newStatus)) {
    return { ok: false, error: `מעבר מ-${order.status} ל-${newStatus} אינו מותר` };
  }

  await db.$transaction([
    db.order.update({ where: { orderNumber }, data: { status: newStatus } }),
    db.orderStatusEvent.create({
      data: { orderId: order.id, fromStatus: order.status, toStatus: newStatus, changedBy: admin.email },
    }),
  ]);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderNumber}`);
  return { ok: true };
}
