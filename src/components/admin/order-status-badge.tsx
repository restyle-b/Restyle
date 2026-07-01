import type { OrderStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

// אדמין חי מחוץ ל-[locale] (עברית קבועה, בלי next-intl) — לכן תוויות
// כאן קשיחות בעברית, בנפרד מ-src/components/shop/order-status-badge.tsx
// (הגרסה הציבורית, מתורגמת) ולא ניתן לשתף קומפוננטה אחת בין השניים.
const LABEL_BY_STATUS: Record<OrderStatus, string> = {
  PENDING: "ממתין לתשלום",
  PAID: "שולם",
  FULFILLED: "מוכן/נשלח",
  COMPLETED: "הושלם",
  CANCELLED: "בוטל",
  FAILED: "נכשל",
};

const COLOR_BY_STATUS: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-900/60 text-yellow-200",
  PAID: "bg-blue-900/60 text-blue-200",
  FULFILLED: "bg-purple-900/60 text-purple-200",
  COMPLETED: "bg-green-900/60 text-green-200",
  CANCELLED: "bg-red-900/60 text-red-200",
  FAILED: "bg-red-900/60 text-red-200",
};

export function AdminOrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={cn("inline-block rounded-full px-3 py-1 text-xs font-medium", COLOR_BY_STATUS[status])}>
      {LABEL_BY_STATUS[status]}
    </span>
  );
}
