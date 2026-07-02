import type { Metadata } from "next";
import Link from "next/link";
import type { EnrollmentStatus } from "@prisma/client";
import { listEnrollments } from "@/server/actions/admin/enrollments";
import { AdminEnrollmentStatusBadge } from "@/components/admin/enrollment-status-badge";
import { formatAgorot } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "הרשמות לקורסים | ניהול" };
export const dynamic = "force-dynamic";

const STATUS_OPTIONS: EnrollmentStatus[] = ["PENDING", "DEPOSIT_PAID", "PAID", "CANCELLED", "FAILED"];
const STATUS_LABELS: Record<EnrollmentStatus, string> = {
  PENDING: "ממתין לתשלום",
  DEPOSIT_PAID: "מקדמה שולמה",
  PAID: "שולם במלואו",
  CANCELLED: "בוטל",
  FAILED: "נכשל",
};

export default async function AdminEnrollmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const statusFilter = STATUS_OPTIONS.includes(status as EnrollmentStatus)
    ? (status as EnrollmentStatus)
    : undefined;
  const enrollments = await listEnrollments(statusFilter);

  return (
    <div>
      <h1 className="text-2xl font-semibold">הרשמות לקורסים</h1>
      <p className="mt-1 text-neutral-400">עד 100 ההרשמות האחרונות. לחצו על הרשמה לפרטים ולשינוי סטטוס.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/admin/enrollments"
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm transition-colors",
            !statusFilter ? "border-accent bg-accent text-ink" : "border-line-dark text-neutral-300 hover:bg-ink-soft",
          )}
        >
          הכל
        </Link>
        {STATUS_OPTIONS.map((s) => (
          <Link
            key={s}
            href={`/admin/enrollments?status=${s}`}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition-colors",
              statusFilter === s ? "border-accent bg-accent text-ink" : "border-line-dark text-neutral-300 hover:bg-ink-soft",
            )}
          >
            {STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {enrollments.length === 0 && <p className="text-neutral-400">אין הרשמות בסינון זה.</p>}
        {enrollments.map((e) => (
          <Link
            key={e.id}
            href={`/admin/enrollments/${e.enrollmentNumber}`}
            className="flex items-center justify-between gap-4 rounded-lg border border-line-dark p-4 hover:border-accent"
          >
            <div>
              <p className="font-medium">{e.enrollmentNumber}</p>
              <p className="text-sm text-neutral-400">
                {e.courseNameHeSnapshot} · {e.customerName}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-neutral-300">
                {formatAgorot(e.amountPaidAgorot, "he")} / {formatAgorot(e.coursePriceAgorot, "he")}
              </span>
              <AdminEnrollmentStatusBadge status={e.status} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
