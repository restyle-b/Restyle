"use client";

import { useState } from "react";
import type { OrderStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "@/server/actions/admin/orders";
import { ALLOWED_ORDER_TRANSITIONS } from "@/lib/admin/order-status-transitions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "ממתין לתשלום",
  PAID: "שולם",
  FULFILLED: "מוכן/נשלח",
  COMPLETED: "הושלם",
  CANCELLED: "בוטל",
  FAILED: "נכשל",
};

export function OrderStatusForm({
  orderNumber,
  currentStatus,
}: {
  orderNumber: string;
  currentStatus: OrderStatus;
}) {
  const router = useRouter();
  const allowed = ALLOWED_ORDER_TRANSITIONS[currentStatus];
  const [target, setTarget] = useState<OrderStatus | "">("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (allowed.length === 0) {
    return <p className="text-sm text-neutral-400">אין מעברי סטטוס זמינים מהמצב הנוכחי.</p>;
  }

  async function onSubmit() {
    if (!target) return;
    setIsSubmitting(true);
    setMessage(null);
    const result = await updateOrderStatus(orderNumber, target);
    setIsSubmitting(false);
    if (result.ok) {
      setMessage({ ok: true, text: "הסטטוס עודכן" });
      router.refresh();
    } else {
      setMessage({ ok: false, text: result.error });
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={target}
        onChange={(e) => setTarget(e.target.value as OrderStatus)}
        className="rounded-md border border-line-dark bg-ink-soft px-3 py-2 text-sm text-white"
      >
        <option value="">בחר סטטוס חדש</option>
        {allowed.map((status) => (
          <option key={status} value={status}>
            {STATUS_LABELS[status]}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={onSubmit}
        disabled={!target || isSubmitting}
        className={cn(buttonVariants({ size: "sm", variant: "light" }))}
      >
        {isSubmitting ? "מעדכן..." : "עדכון סטטוס"}
      </button>
      {message && (
        <span className={cn("text-sm", message.ok ? "text-green-400" : "text-red-400")}>
          {message.text}
        </span>
      )}
    </div>
  );
}
