"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { Order, OrderItem, Payment, OrderStatusEvent } from "@prisma/client";
import { TableRow, TableCell } from "@/components/ui/table";
import { AdminPaymentStatusBadge } from "@/components/admin/order-status-badge";
import { OrderStatusMenu } from "@/components/admin/orders/order-status-menu";
import { StatusHistory } from "@/components/admin/status-history";
import { formatAgorot } from "@/lib/format";
import { cn } from "@/lib/utils";

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "ממתין לתשלום",
  PAID: "שולם",
  FULFILLED: "מוכן/נשלח",
  COMPLETED: "הושלם",
  CANCELLED: "בוטל",
  FAILED: "נכשל",
};

const DELIVERY_LABELS: Record<string, string> = { PICKUP: "איסוף עצמי", DELIVERY: "משלוח" };

type OrderRowData = Order & {
  payment: Payment | null;
  items: OrderItem[];
  statusEvents: OrderStatusEvent[];
};

export function OrderRow({ order }: { order: OrderRowData }) {
  const [expanded, setExpanded] = useState(false);
  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <>
      <TableRow className="cursor-pointer" onClick={() => setExpanded((v) => !v)}>
        <TableCell>
          <ChevronDown className={cn("h-4 w-4 text-neutral-500 transition-transform", expanded && "rotate-180")} />
        </TableCell>
        <TableCell>
          <Link
            href={`/admin/orders/${order.orderNumber}`}
            onClick={(e) => e.stopPropagation()}
            className="font-medium text-white hover:text-accent hover:underline"
          >
            {order.orderNumber}
          </Link>
        </TableCell>
        <TableCell>
          <p className="text-white">{order.customerName}</p>
          <p className="text-xs text-neutral-500">{order.customerEmail}</p>
        </TableCell>
        <TableCell className="text-neutral-400 [direction:ltr] [font-variant-numeric:tabular-nums]">
          {new Date(order.createdAt).toLocaleDateString("he-IL")}
        </TableCell>
        <TableCell className="text-neutral-400">{itemCount}</TableCell>
        <TableCell className="font-medium text-white">{formatAgorot(order.totalAgorot, "he")}</TableCell>
        <TableCell>
          <AdminPaymentStatusBadge status={order.payment?.status ?? null} />
        </TableCell>
        <TableCell onClick={(e) => e.stopPropagation()}>
          <OrderStatusMenu orderNumber={order.orderNumber} status={order.status} />
        </TableCell>
      </TableRow>

      {expanded && (
        <TableRow className="bg-white/[0.02] hover:bg-white/[0.02]">
          <TableCell colSpan={8}>
            <div className="grid gap-6 py-2 lg:grid-cols-3">
              <div>
                <h4 className="text-xs font-medium tracking-wide text-neutral-500 uppercase">פריטים</h4>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex items-center justify-between gap-4">
                      <span className="text-neutral-300">
                        {item.nameHeSnapshot} × {item.quantity}
                      </span>
                      <span className="text-neutral-400">{formatAgorot(item.lineTotalAgorot, "he")}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 space-y-1 border-t border-line-dark pt-2 text-sm text-neutral-400">
                  <div className="flex justify-between">
                    <span>משלוח</span>
                    <span>{formatAgorot(order.shippingAgorot, "he")}</span>
                  </div>
                  <div className="flex justify-between font-medium text-white">
                    <span>סה&quot;כ</span>
                    <span>{formatAgorot(order.totalAgorot, "he")}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-medium tracking-wide text-neutral-500 uppercase">מסירה</h4>
                <p className="mt-2 text-sm text-neutral-300">{DELIVERY_LABELS[order.deliveryMethod]}</p>
                {order.deliveryMethod === "DELIVERY" && (
                  <p className="mt-1 text-sm text-neutral-400">
                    {order.addressLine}
                    {order.addressLine && order.addressCity ? ", " : ""}
                    {order.addressCity}
                  </p>
                )}
                <p className="mt-3 text-sm text-neutral-400">{order.customerPhone}</p>
              </div>

              <div>
                <h4 className="text-xs font-medium tracking-wide text-neutral-500 uppercase">היסטוריית סטטוס</h4>
                <div className="mt-3">
                  <StatusHistory events={order.statusEvents} labels={ORDER_STATUS_LABELS} />
                </div>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
