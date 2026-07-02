import type { EnrollmentStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

// אדמין בעברית קבועה (מחוץ ל-[locale]) — תוויות קשיחות, בנפרד מהגרסה הציבורית.
const LABEL: Record<EnrollmentStatus, string> = {
  PENDING: "ממתין לתשלום",
  DEPOSIT_PAID: "מקדמה שולמה",
  PAID: "שולם במלואו",
  CANCELLED: "בוטל",
  FAILED: "נכשל",
};

const COLOR: Record<EnrollmentStatus, string> = {
  PENDING: "bg-yellow-900/60 text-yellow-200",
  DEPOSIT_PAID: "bg-blue-900/60 text-blue-200",
  PAID: "bg-green-900/60 text-green-200",
  CANCELLED: "bg-red-900/60 text-red-200",
  FAILED: "bg-red-900/60 text-red-200",
};

export function AdminEnrollmentStatusBadge({ status }: { status: EnrollmentStatus }) {
  return (
    <span className={cn("inline-block rounded-full px-3 py-1 text-xs font-medium", COLOR[status])}>
      {LABEL[status]}
    </span>
  );
}
