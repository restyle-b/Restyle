import type { EnrollmentStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

// אדמין בעברית קבועה (מחוץ ל-[locale]) — תוויות קשיחות, בנפרד מהגרסה הציבורית.
const LABEL: Record<EnrollmentStatus, string> = {
  PENDING: "ממתין לתשלום",
  DEPOSIT_PAID: "מקדמה שולמה",
  PAID: "שולם במלואו",
  CANCELLED: "בוטל",
  FAILED: "נכשל",
};

const TONE: Record<EnrollmentStatus, "warning" | "info" | "success" | "danger"> = {
  PENDING: "warning",
  DEPOSIT_PAID: "info",
  PAID: "success",
  CANCELLED: "danger",
  FAILED: "danger",
};

export function AdminEnrollmentStatusBadge({ status }: { status: EnrollmentStatus }) {
  return <Badge tone={TONE[status]}>{LABEL[status]}</Badge>;
}
