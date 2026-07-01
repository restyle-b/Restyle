import type { OrderStatus } from "@prisma/client";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const COLOR_BY_STATUS: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-900/60 text-yellow-200",
  PAID: "bg-blue-900/60 text-blue-200",
  FULFILLED: "bg-purple-900/60 text-purple-200",
  COMPLETED: "bg-green-900/60 text-green-200",
  CANCELLED: "bg-red-900/60 text-red-200",
  FAILED: "bg-red-900/60 text-red-200",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const t = useTranslations("orders.status");
  return (
    <span
      className={cn(
        "inline-block rounded-full px-3 py-1 text-xs font-medium",
        COLOR_BY_STATUS[status],
      )}
    >
      {t(status)}
    </span>
  );
}
