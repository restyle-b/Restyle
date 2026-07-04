"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { EnrollmentStatus } from "@prisma/client";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { updateEnrollmentStatus } from "@/server/actions/admin/enrollments";
import { ALLOWED_ENROLLMENT_TRANSITIONS } from "@/lib/admin/enrollment-status-transitions";
import { AdminEnrollmentStatusBadge } from "@/components/admin/enrollment-status-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const STATUS_LABELS: Record<EnrollmentStatus, string> = {
  PENDING: "ממתין לתשלום",
  DEPOSIT_PAID: "מקדמה שולמה",
  PAID: "שולם במלואו",
  CANCELLED: "בוטל",
  FAILED: "נכשל",
};

/** שינוי סטטוס הרשמה — תפריט קומפקטי לשורת הטבלה; CANCELLED דורש אישור. */
export function EnrollmentStatusMenu({
  enrollmentNumber,
  status,
}: {
  enrollmentNumber: string;
  status: EnrollmentStatus;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingCancel, setPendingCancel] = useState(false);
  const allowed = ALLOWED_ENROLLMENT_TRANSITIONS[status];

  function apply(newStatus: EnrollmentStatus) {
    startTransition(async () => {
      const result = await updateEnrollmentStatus(enrollmentNumber, newStatus);
      if (result.ok) {
        toast.success(`סטטוס עודכן ל"${STATUS_LABELS[newStatus]}"`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  if (allowed.length === 0) {
    return <AdminEnrollmentStatusBadge status={status} />;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" disabled={isPending} className="flex items-center gap-1 disabled:opacity-50">
            <AdminEnrollmentStatusBadge status={status} />
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
        title="ביטול הרשמה"
        description={`לבטל את ההרשמה ${enrollmentNumber}? הפעולה אינה הפיכה.`}
        confirmLabel="ביטול ההרשמה"
        onConfirm={() => apply("CANCELLED")}
      />
    </>
  );
}
