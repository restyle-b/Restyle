import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEnrollment } from "@/server/actions/admin/enrollments";
import { AdminEnrollmentStatusBadge } from "@/components/admin/enrollment-status-badge";
import { EnrollmentStatusForm } from "@/components/admin/enrollment-status-form";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { formatAgorot } from "@/lib/format";

export const metadata: Metadata = { title: "פרטי הרשמה | ניהול" };
export const dynamic = "force-dynamic";

const KIND_LABELS: Record<string, string> = { DEPOSIT: "מקדמה", BALANCE: "יתרה", FULL: "תשלום מלא" };
const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "ממתין",
  SUCCEEDED: "שולם",
  FAILED: "נכשל",
  REFUNDED: "זוכה",
  PARTIALLY_REFUNDED: "זוכה חלקית",
};

export default async function AdminEnrollmentDetailPage({
  params,
}: {
  params: Promise<{ enrollmentNumber: string }>;
}) {
  const { enrollmentNumber } = await params;
  const enrollment = await getEnrollment(enrollmentNumber);
  if (!enrollment) notFound();

  const balance = enrollment.coursePriceAgorot - enrollment.amountPaidAgorot;

  return (
    <div className="max-w-3xl">
      <Breadcrumb
        items={[{ label: "הרשמות לקורסים", href: "/admin/enrollments" }, { label: enrollment.enrollmentNumber }]}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{enrollment.enrollmentNumber}</h1>
        <AdminEnrollmentStatusBadge status={enrollment.status} />
      </div>

      <div className="mt-4">
        <EnrollmentStatusForm enrollmentNumber={enrollment.enrollmentNumber} currentStatus={enrollment.status} />
      </div>

      <dl className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-neutral-400">קורס</dt>
          <dd>{enrollment.courseNameHeSnapshot}</dd>
        </div>
        <div>
          <dt className="text-sm text-neutral-400">לקוח</dt>
          <dd>{enrollment.customerName}</dd>
        </div>
        <div>
          <dt className="text-sm text-neutral-400">אימייל</dt>
          <dd>{enrollment.customerEmail}</dd>
        </div>
        <div>
          <dt className="text-sm text-neutral-400">טלפון</dt>
          <dd>{enrollment.customerPhone}</dd>
        </div>
        <div>
          <dt className="text-sm text-neutral-400">משתמש רשום</dt>
          <dd>{enrollment.user?.email ?? "אורח"}</dd>
        </div>
        <div>
          <dt className="text-sm text-neutral-400">מחיר / שולם / יתרה</dt>
          <dd>
            {formatAgorot(enrollment.coursePriceAgorot, "he")} · {formatAgorot(enrollment.amountPaidAgorot, "he")} ·{" "}
            {formatAgorot(balance, "he")}
          </dd>
        </div>
      </dl>

      <div className="mt-8">
        <h2 className="text-lg font-semibold">תשלומים</h2>
        <div className="mt-3 space-y-2">
          {enrollment.payments.map((p) => (
            <div key={p.id} className="flex items-center justify-between text-sm">
              <span>
                {KIND_LABELS[p.kind] ?? p.kind} · {formatAgorot(p.amountAgorot, "he")}
              </span>
              <span className="text-neutral-400">{PAYMENT_STATUS_LABELS[p.status] ?? p.status}</span>
            </div>
          ))}
          {enrollment.payments.length === 0 && <p className="text-sm text-neutral-400">אין תשלומים.</p>}
        </div>
      </div>
    </div>
  );
}
