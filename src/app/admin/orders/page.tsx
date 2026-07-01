import type { Metadata } from "next";
import Link from "next/link";
import type { OrderStatus } from "@prisma/client";
import { listOrders } from "@/server/actions/admin/orders";
import { AdminOrderStatusBadge } from "@/components/admin/order-status-badge";
import { formatAgorot } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "הזמנות | ניהול" };
export const dynamic = "force-dynamic";

const STATUS_OPTIONS: OrderStatus[] = ["PENDING", "PAID", "FULFILLED", "COMPLETED", "CANCELLED", "FAILED"];
const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "ממתין לתשלום",
  PAID: "שולם",
  FULFILLED: "מוכן/נשלח",
  COMPLETED: "הושלם",
  CANCELLED: "בוטל",
  FAILED: "נכשל",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const statusFilter = STATUS_OPTIONS.includes(status as OrderStatus) ? (status as OrderStatus) : undefined;
  const orders = await listOrders(statusFilter);

  return (
    <div>
      <h1 className="text-2xl font-semibold">הזמנות</h1>
      <p className="mt-1 text-neutral-400">עד 100 ההזמנות האחרונות. לחצו על הזמנה לפרטים ולשינוי סטטוס.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/admin/orders"
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm transition-colors",
            !statusFilter ? "border-accent bg-accent text-ink" : "border-line-dark text-neutral-300 hover:bg-ink-soft",
          )}
        >
          הכל
        </Link>
        {STATUS_OPTIONS.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition-colors",
              statusFilter === s ? "border-accent bg-accent text-ink" : "border-line-dark text-neutral-300 hover:bg-ink-soft",
            )}
          >
            {STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {orders.length === 0 && <p className="text-neutral-400">אין הזמנות בסינון זה.</p>}
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/admin/orders/${order.orderNumber}`}
            className="flex items-center justify-between gap-4 rounded-lg border border-line-dark p-4 hover:border-accent"
          >
            <div>
              <p className="font-medium">{order.orderNumber}</p>
              <p className="text-sm text-neutral-400">
                {order.customerName} · {new Date(order.createdAt).toLocaleDateString("he-IL")}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-neutral-300">{formatAgorot(order.totalAgorot, "he")}</span>
              <AdminOrderStatusBadge status={order.status} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
