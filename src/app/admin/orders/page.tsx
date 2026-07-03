import type { Metadata } from "next";
import Link from "next/link";
import type { OrderStatus, PaymentStatus } from "@prisma/client";
import { listOrders, getOrdersOverview } from "@/server/actions/admin/orders";
import { OrderRow } from "@/components/admin/orders/order-row";
import { Pagination } from "@/components/admin/pagination";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead } from "@/components/ui/table";
import { adminInputClass } from "@/lib/admin/form-styles";
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

const PAYMENT_OPTIONS: PaymentStatus[] = ["PENDING", "SUCCEEDED", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED"];
const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  PENDING: "תשלום ממתין",
  SUCCEEDED: "שולם בהצלחה",
  FAILED: "תשלום נכשל",
  REFUNDED: "זוכה",
  PARTIALLY_REFUNDED: "זוכה חלקית",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; payment?: string; q?: string; page?: string }>;
}) {
  const { status, payment, q, page: pageParam } = await searchParams;
  const statusFilter = STATUS_OPTIONS.includes(status as OrderStatus) ? (status as OrderStatus) : undefined;
  const paymentStatusFilter = PAYMENT_OPTIONS.includes(payment as PaymentStatus) ? (payment as PaymentStatus) : undefined;
  const page = Math.max(1, Number(pageParam) || 1);
  const [{ orders, total, pageSize }, overview] = await Promise.all([
    listOrders({ statusFilter, paymentStatusFilter, search: q, page }),
    getOrdersOverview(),
  ]);

  const baseParams = { status: statusFilter, payment: paymentStatusFilter, q };

  function filterHref(next: Partial<typeof baseParams>) {
    const merged = { ...baseParams, ...next };
    const search = new URLSearchParams();
    if (merged.status) search.set("status", merged.status);
    if (merged.payment) search.set("payment", merged.payment);
    if (merged.q) search.set("q", merged.q);
    const qs = search.toString();
    return qs ? `/admin/orders?${qs}` : "/admin/orders";
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">הזמנות</h1>
      <p className="mt-1 text-sm text-neutral-400">{total} הזמנות בסינון הנוכחי.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-accent [font-variant-numeric:tabular-nums]">
              {overview.pendingCount}
            </div>
            <div className="mt-1 text-xs text-neutral-400">ממתינות לתשלום</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white [font-variant-numeric:tabular-nums]">
              {overview.todayOrders}
            </div>
            <div className="mt-1 text-xs text-neutral-400">הזמנות היום</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">{formatAgorot(overview.todayRevenueAgorot, "he")}</div>
            <div className="mt-1 text-xs text-neutral-400">מחזור היום</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">{formatAgorot(overview.avgOrderAgorot, "he")}</div>
            <div className="mt-1 text-xs text-neutral-400">שווי הזמנה ממוצע</div>
          </CardContent>
        </Card>
      </div>

      <form method="get" className="mt-8 flex flex-wrap items-center gap-2">
        {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
        {paymentStatusFilter && <input type="hidden" name="payment" value={paymentStatusFilter} />}
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="חיפוש: מספר הזמנה, שם, אימייל או טלפון"
          className={cn(adminInputClass, "max-w-xs")}
        />
        <button type="submit" className="rounded-md border border-line-dark px-4 py-2 text-sm hover:border-accent">
          חיפוש
        </button>
        {q && (
          <Link href={filterHref({ q: undefined })} className="text-sm text-neutral-400 hover:text-white">
            נקה חיפוש
          </Link>
        )}
        <select name="payment" defaultValue={paymentStatusFilter ?? ""} className={cn(adminInputClass, "w-auto")}>
          <option value="">כל סטטוסי התשלום</option>
          {PAYMENT_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {PAYMENT_LABELS[p]}
            </option>
          ))}
        </select>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={filterHref({ status: undefined })}
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
            href={filterHref({ status: s })}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition-colors",
              statusFilter === s ? "border-accent bg-accent text-ink" : "border-line-dark text-neutral-300 hover:bg-ink-soft",
            )}
          >
            {STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <p className="mt-8 text-center text-neutral-400">אין הזמנות בסינון זה.</p>
      ) : (
        <div className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>מספר הזמנה</TableHead>
                <TableHead>לקוח</TableHead>
                <TableHead>תאריך</TableHead>
                <TableHead>פריטים</TableHead>
                <TableHead>סה&quot;כ</TableHead>
                <TableHead>תשלום</TableHead>
                <TableHead>סטטוס</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <OrderRow key={order.id} order={order} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Pagination
        basePath="/admin/orders"
        params={{ status: statusFilter, payment: paymentStatusFilter, q }}
        page={page}
        pageSize={pageSize}
        total={total}
      />
    </div>
  );
}
