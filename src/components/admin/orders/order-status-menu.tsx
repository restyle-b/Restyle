"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { OrderStatus } from "@prisma/client";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { updateOrderStatus } from "@/server/actions/admin/orders";
import { ALLOWED_ORDER_TRANSITIONS } from "@/lib/admin/order-status-transitions";
import { AdminOrderStatusBadge } from "@/components/admin/order-status-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "ממתין לתשלום",
  PAID: "שולם",
  FULFILLED: "מוכן/נשלח",
  COMPLETED: "הושלם",
  CANCELLED: "בוטל",
  FAILED: "נכשל",
};

/** שינוי סטטוס הזמנה — תפריט קומפקטי לשורת הטבלה; CANCELLED דורש אישור. */
export function OrderStatusMenu({ orderNumber, status }: { orderNumber: string; status: OrderStatus }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingCancel, setPendingCancel] = useState(false);
  const allowed = ALLOWED_ORDER_TRANSITIONS[status];

  function apply(newStatus: OrderStatus) {
    startTransition(async () => {
      const result = await updateOrderStatus(orderNumber, newStatus);
      if (result.ok) {
        toast.success(`סטטוס עודכן ל"${STATUS_LABELS[newStatus]}"`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  if (allowed.length === 0) {
    return <AdminOrderStatusBadge status={status} />;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" disabled={isPending} className="flex items-center gap-1 disabled:opacity-50">
            <AdminOrderStatusBadge status={status} />
            <ChevronDown className="h-3.5 w-3.5 text-neutral-500" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {allowed.map((next) => (
            <DropdownMenuItem
              key={next}
              destructive={next === "CANCELLED"}
              onSelect={() => (next === "CANCELLED" ? setPendingCancel(true) : apply(next))}
            >
              מעבר ל: {STATUS_LABELS[next]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={pendingCancel}
        onOpenChange={setPendingCancel}
        title="ביטול הזמנה"
        description={`לבטל את ההזמנה ${orderNumber}? הפעולה אינה הפיכה.`}
        confirmLabel="ביטול ההזמנה"
        onConfirm={() => apply("CANCELLED")}
      />
    </>
  );
}
