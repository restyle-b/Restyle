import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrder } from "@/server/actions/admin/orders";
import { AdminOrderStatusBadge, AdminPaymentStatusBadge } from "@/components/admin/order-status-badge";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { StatusHistory } from "@/components/admin/status-history";
import { Card, CardContent } from "@/components/ui/card";
import { formatAgorot } from "@/lib/format";

export const metadata: Metadata = { title: "פרטי הזמנה | ניהול" };
export const dynamic = "force-dynamic";

const DELIVERY_LABELS: Record<string, string> = {
  PICKUP: "איסוף עצמי",
  DELIVERY: "משלוח",
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "ממתין לתשלום",
  PAID: "שולם",
  FULFILLED: "מוכן/נשלח",
  COMPLETED: "הושלם",
  CANCELLED: "בוטל",
  FAILED: "נכשל",
};

const PROVIDER_LABELS: Record<string, string> = {
  mock: "תשלום מדומה (בדיקות)",
  tranzila: "כרטיס אשראי (טרנזילה)",
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
      <Breadcrumb items={[{ label: "הזמנות", href: "/admin/orders" }, { label: order.orderNumber }]} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-white">{order.orderNumber}</h1>
        <div className="flex items-center gap-2">
          <AdminOrderStatusBadge status={order.status} />
          <AdminPaymentStatusBadge status={order.payment?.status ?? null} />
        </div>
      </div>

      <Card className="mt-4">
        <CardContent className="p-4">
          <OrderStatusForm orderNumber={order.orderNumber} currentStatus={order.status} />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-neutral-400">לקוח</dt>
            <dd className="text-white">{order.customerName}</dd>
          </div>
          <div>
            <dt className="text-sm text-neutral-400">אימייל</dt>
            <dd className="text-white">{order.customerEmail}</dd>
          </div>
          <div>
            <dt className="text-sm text-neutral-400">טלפון</dt>
            <dd className="text-white">{order.customerPhone}</dd>
          </div>
          <div>
            <dt className="text-sm text-neutral-400">משתמש רשום</dt>
            <dd className="text-white">{order.user?.email ?? "אורח"}</dd>
          </div>
          <div>
            <dt className="text-sm text-neutral-400">אופן קבלה</dt>
            <dd className="text-white">{DELIVERY_LABELS[order.deliveryMethod]}</dd>
          </div>
          {order.deliveryMethod === "DELIVERY" && (
            <div>
              <dt className="text-sm text-neutral-400">כתובת</dt>
              <dd className="text-white">
                {order.addressLine}
                {order.addressLine && order.addressCity ? ", " : ""}
                {order.addressCity}
              </dd>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="p-5">
          <h2 className="text-sm font-medium text-neutral-300">פריטים</h2>
          <div className="mt-3 space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-neutral-300">
                  {item.nameHeSnapshot} × {item.quantity}
                </span>
                <span className="text-white">{formatAgorot(item.lineTotalAgorot, "he")}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-1 border-t border-line-dark pt-3 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-400">סכום ביניים</span>
              <span className="text-white">{formatAgorot(order.subtotalAgorot, "he")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">משלוח</span>
              <span className="text-white">{formatAgorot(order.shippingAgorot, "he")}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-white">סה&quot;כ</span>
              <span className="text-accent">{formatAgorot(order.totalAgorot, "he")}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {order.payment && (
        <Card className="mt-6">
          <CardContent className="p-5">
            <h2 className="text-sm font-medium text-neutral-300">תשלום</h2>
            <dl className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-neutral-400">אמצעי תשלום</dt>
                <dd className="text-white">{PROVIDER_LABELS[order.payment.provider] ?? order.payment.provider}</dd>
              </div>
              {order.payment.last4 && (
                <div>
                  <dt className="text-neutral-400">4 ספרות אחרונות</dt>
                  <dd className="text-white">**** {order.payment.last4}</dd>
                </div>
              )}
              <div>
                <dt className="text-neutral-400">חשבונית</dt>
                {/* חשבונית מס תחובר בהמשך — ממתין לבחירת ספק חשבוניות + מספר עוסק (החלטת המשתמש 2026-07-01). */}
                <dd className="text-neutral-500">תחובר בהמשך (ספק חשבוניות טרם נבחר)</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardContent className="p-5">
          <h2 className="text-sm font-medium text-neutral-300">היסטוריית סטטוס</h2>
          <div className="mt-4">
            <StatusHistory events={order.statusEvents} labels={ORDER_STATUS_LABELS} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
