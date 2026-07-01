"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { OrderStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth/require-admin";
import { db } from "@/lib/db";
import { ALLOWED_ORDER_TRANSITIONS } from "@/lib/admin/order-status-transitions";

export type AdminActionResult = { ok: true } | { ok: false; error: string };

// TypeScript מאכיף את הטיפוס הזה רק בזמן קומפילציה — קריאה ישירה ל-server
// action (בעקיפין ל-client bundle) יכולה לשלוח כל string. ולידציה מפורשת
// כאן היא ההגנה בפועל, לא רק הסתמכות על allow-list/Prisma enum כ-backstop עקיף.
const orderStatusSchema = z.enum(["PENDING", "PAID", "FULFILLED", "COMPLETED", "CANCELLED", "FAILED"]);

export async function listOrders(statusFilter?: OrderStatus) {
  await requireAdmin();
  return db.order.findMany({
    where: statusFilter ? { status: statusFilter } : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { payment: true },
  });
}

export async function getOrder(orderNumber: string) {
  await requireAdmin();
  return db.order.findUnique({
    where: { orderNumber },
    include: { items: true, payment: true, user: { select: { email: true } } },
  });
}

export async function updateOrderStatus(
  orderNumber: string,
  newStatusInput: OrderStatus,
): Promise<AdminActionResult> {
  await requireAdmin();

  const parsedStatus = orderStatusSchema.safeParse(newStatusInput);
  if (!parsedStatus.success) {
    return { ok: false, error: "סטטוס לא תקין" };
  }
  const newStatus = parsedStatus.data;

  const order = await db.order.findUnique({ where: { orderNumber }, select: { status: true } });
  if (!order) {
    return { ok: false, error: "הזמנה לא נמצאה" };
  }

  const allowed = ALLOWED_ORDER_TRANSITIONS[order.status];
  if (!allowed.includes(newStatus)) {
    return { ok: false, error: `מעבר מ-${order.status} ל-${newStatus} אינו מותר` };
  }

  await db.order.update({ where: { orderNumber }, data: { status: newStatus } });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderNumber}`);
  return { ok: true };
}
