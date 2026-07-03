import type { OrderStatus, PaymentStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

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

const TONE_BY_STATUS: Record<OrderStatus, "warning" | "info" | "purple" | "success" | "danger"> = {
  PENDING: "warning",
  PAID: "info",
  FULFILLED: "purple",
  COMPLETED: "success",
  CANCELLED: "danger",
  FAILED: "danger",
};

export function AdminOrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={TONE_BY_STATUS[status]}>{LABEL_BY_STATUS[status]}</Badge>;
}

const PAYMENT_LABEL: Record<PaymentStatus, string> = {
  PENDING: "תשלום ממתין",
  SUCCEEDED: "שולם בהצלחה",
  FAILED: "תשלום נכשל",
  REFUNDED: "זוכה",
  PARTIALLY_REFUNDED: "זוכה חלקית",
};

const PAYMENT_TONE: Record<PaymentStatus, "warning" | "success" | "danger" | "outline"> = {
  PENDING: "warning",
  SUCCEEDED: "success",
  FAILED: "danger",
  REFUNDED: "outline",
  PARTIALLY_REFUNDED: "outline",
};

export function AdminPaymentStatusBadge({ status }: { status: PaymentStatus | null }) {
  if (!status) return <Badge tone="outline">ללא תשלום</Badge>;
  return <Badge tone={PAYMENT_TONE[status]}>{PAYMENT_LABEL[status]}</Badge>;
}
