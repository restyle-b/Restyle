import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrder } from "@/server/actions/admin/orders";
import { AdminOrderStatusBadge } from "@/components/admin/order-status-badge";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { formatAgorot } from "@/lib/format";

export const metadata: Metadata = { title: "פרטי הזמנה | ניהול" };
export const dynamic = "force-dynamic";

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "ממתין",
  SUCCEEDED: "שולם בהצלחה",
  FAILED: "נכשל",
  REFUNDED: "זוכה",
  PARTIALLY_REFUNDED: "זוכה חלקית",
};

const DELIVERY_LABELS: Record<string, string> = {
  PICKUP: "איסוף עצמי",
  DELIVERY: "משלוח",
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await getOrder(orderNumber);
  if (!order) notFound();

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{order.orderNumber}</h1>
        <AdminOrderStatusBadge status={order.status} />
      </div>

      <div className="mt-4">
        <OrderStatusForm orderNumber={order.orderNumber} currentStatus={order.status} />
      </div>

      <dl className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-neutral-400">לקוח</dt>
          <dd>{order.customerName}</dd>
        </div>
        <div>
          <dt className="text-sm text-neutral-400">אימייל</dt>
          <dd>{order.customerEmail}</dd>
        </div>
        <div>
          <dt className="text-sm text-neutral-400">טלפון</dt>
          <dd>{order.customerPhone}</dd>
        </div>
        <div>
          <dt className="text-sm text-neutral-400">משתמש רשום</dt>
          <dd>{order.user?.email ?? "אורח"}</dd>
        </div>
        <div>
          <dt className="text-sm text-neutral-400">אופן קבלה</dt>
          <dd>{DELIVERY_LABELS[order.deliveryMethod]}</dd>
        </div>
        {order.deliveryMethod === "DELIVERY" && (
          <div>
            <dt className="text-sm text-neutral-400">כתובת</dt>
            <dd>
              {order.addressLine}
              {order.addressLine && order.addressCity ? ", " : ""}
              {order.addressCity}
            </dd>
          </div>
        )}
      </dl>

      <div className="mt-8">
        <h2 className="text-lg font-semibold">פריטים</h2>
        <div className="mt-3 space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span>
                {item.nameHeSnapshot} × {item.quantity}
              </span>
              <span>{formatAgorot(item.lineTotalAgorot, "he")}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-1 border-t border-line-dark pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-400">סכום ביניים</span>
            <span>{formatAgorot(order.subtotalAgorot, "he")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">משלוח</span>
            <span>{formatAgorot(order.shippingAgorot, "he")}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>סה&quot;כ</span>
            <span>{formatAgorot(order.totalAgorot, "he")}</span>
          </div>
        </div>
      </div>

      {order.payment && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold">תשלום</h2>
          <dl className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-neutral-400">ספק</dt>
              <dd>{order.payment.provider}</dd>
            </div>
            <div>
              <dt className="text-neutral-400">סטטוס</dt>
              <dd>{PAYMENT_STATUS_LABELS[order.payment.status] ?? order.payment.status}</dd>
            </div>
            {order.payment.last4 && (
              <div>
                <dt className="text-neutral-400">4 ספרות אחרונות</dt>
                <dd>**** {order.payment.last4}</dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}
