"use client";

import type { DeliveryMethod, OrderStatus, PaymentStatus } from "@prisma/client";
import { useLocale, useTranslations } from "next-intl";
import { OrderStatusBadge } from "@/components/shop/order-status-badge";
import { formatAgorot } from "@/lib/format";

export type OrderDetailData = {
  orderNumber: string;
  status: OrderStatus;
  createdAt: string | Date;
  deliveryMethod: DeliveryMethod;
  addressLine: string | null;
  addressCity: string | null;
  addressNotes: string | null;
  subtotalAgorot: number;
  shippingAgorot: number;
  totalAgorot: number;
  items: {
    id: string;
    nameHeSnapshot: string;
    unitPriceAgorot: number;
    quantity: number;
    lineTotalAgorot: number;
  }[];
  payment: { status: PaymentStatus; last4: string | null } | null;
  statusEvents?: { id: string; toStatus: OrderStatus; createdAt: string | Date }[];
};

/**
 * תצוגת פרטי הזמנה משותפת — נעשה בה שימוש גם ב-/account/orders/[orderNumber]
 * (server component, מעביר props אחרי DB fetch עצמאי) וגם בתוצאת guest
 * lookup (client). כל הנתונים מגיעים כ-props, אין fetch כאן.
 */
export function OrderDetailCard({ order }: { order: OrderDetailData }) {
  const t = useTranslations("orders.detail");
  const tStatus = useTranslations("orders.status");
  const tCheckout = useTranslations("checkout");
  const locale = useLocale();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-neutral-400">{t("orderNumberLabel")}</p>
          <p className="text-lg font-semibold text-white">{order.orderNumber}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold text-white">{t("itemsTitle")}</h2>
        <div className="mt-3 space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 text-sm">
              <span className="text-neutral-300">
                {item.nameHeSnapshot} × {item.quantity}
              </span>
              <span className="text-white">{formatAgorot(item.lineTotalAgorot, locale)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2 border-t border-line-dark pt-4">
        <div className="flex items-center justify-between text-sm text-neutral-300">
          <span>{t("subtotalLabel")}</span>
          <span>{formatAgorot(order.subtotalAgorot, locale)}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-neutral-300">
          <span>{t("shippingLabel")}</span>
          <span>
            {order.shippingAgorot > 0
              ? formatAgorot(order.shippingAgorot, locale)
              : tCheckout("shippingFree")}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-line-dark pt-2 text-base font-semibold text-white">
          <span>{t("totalLabel")}</span>
          <span className="text-accent">{formatAgorot(order.totalAgorot, locale)}</span>
        </div>
      </div>

      <div className="space-y-2 border-t border-line-dark pt-4 text-sm text-neutral-300">
        <div className="flex items-center justify-between">
          <span>{t("deliveryMethodLabel")}</span>
          <span className="text-white">
            {order.deliveryMethod === "DELIVERY"
              ? tCheckout("deliveryDelivery")
              : tCheckout("deliveryPickup")}
          </span>
        </div>
        {order.deliveryMethod === "DELIVERY" && (order.addressLine || order.addressCity) && (
          <div>
            <p className="text-neutral-400">{t("addressTitle")}</p>
            <p className="text-white">
              {order.addressLine}
              {order.addressLine && order.addressCity ? ", " : ""}
              {order.addressCity}
            </p>
            {order.addressNotes && <p className="text-neutral-400">{order.addressNotes}</p>}
          </div>
        )}
        {order.payment && (
          <div className="flex items-center justify-between">
            <span>{t("paymentStatusLabel")}</span>
            <span className="text-white">
              {t(`paymentStatus.${order.payment.status}`)}
              {order.payment.last4 ? ` (**** ${order.payment.last4})` : ""}
            </span>
          </div>
        )}
      </div>

      {order.statusEvents && order.statusEvents.length > 0 && (
        <div className="border-t border-line-dark pt-4">
          <h2 className="font-display text-lg font-semibold text-white">{t("historyTitle")}</h2>
          <ol className="mt-3 space-y-2">
            {order.statusEvents.map((event) => (
              <li key={event.id} className="flex flex-wrap items-baseline gap-x-3 text-sm">
                <span className="text-neutral-500 [direction:ltr] [font-variant-numeric:tabular-nums]">
                  {new Date(event.createdAt).toLocaleString(locale, { dateStyle: "short", timeStyle: "short" })}
                </span>
                <span className="text-white">{tStatus(event.toStatus)}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
