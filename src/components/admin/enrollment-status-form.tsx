"use client";

import { useState } from "react";
import type { EnrollmentStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { updateEnrollmentStatus } from "@/server/actions/admin/enrollments";
import { ALLOWED_ENROLLMENT_TRANSITIONS } from "@/lib/admin/enrollment-status-transitions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LABEL: Record<EnrollmentStatus, string> = {
  PENDING: "ממתין לתשלום",
  DEPOSIT_PAID: "מקדמה שולמה",
  PAID: "שולם במלואו",
  CANCELLED: "בוטל",
  FAILED: "נכשל",
};

export function EnrollmentStatusForm({
  enrollmentNumber,
  currentStatus,
}: {
  enrollmentNumber: string;
  currentStatus: EnrollmentStatus;
}) {
  const router = useRouter();
  const allowed = ALLOWED_ENROLLMENT_TRANSITIONS[currentStatus];
  const [target, setTarget] = useState<EnrollmentStatus | "">("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (allowed.length === 0) {
    return <p className="text-sm text-neutral-400">אין מעברי סטטוס זמינים מהמצב הנוכחי.</p>;
  }

  async function onSubmit() {
    if (!target) return;
    setIsSubmitting(true);
    setMessage(null);
    const result = await updateEnrollmentStatus(enrollmentNumber, target);
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
        onChange={(e) => setTarget(e.target.value as EnrollmentStatus)}
        className="rounded-md border border-line-dark bg-ink-soft px-3 py-2 text-sm text-white"
      >
        <option value="">בחר סטטוס חדש</option>
        {allowed.map((status) => (
          <option key={status} value={status}>
            {LABEL[status]}
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
        <span className={cn("text-sm", message.ok ? "text-green-400" : "text-red-400")}>{message.text}</span>
      )}
    </div>
  );
}
