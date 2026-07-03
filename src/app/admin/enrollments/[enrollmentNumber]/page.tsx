import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEnrollment } from "@/server/actions/admin/enrollments";
import { AdminEnrollmentStatusBadge } from "@/components/admin/enrollment-status-badge";
import { EnrollmentStatusForm } from "@/components/admin/enrollment-status-form";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { StatusHistory } from "@/components/admin/status-history";
import { Card, CardContent } from "@/components/ui/card";
import { formatAgorot } from "@/lib/format";

export const metadata: Metadata = { title: "פרטי הרשמה | ניהול" };
export const dynamic = "force-dynamic";

const KIND_LABELS: Record<string, string> = { DEPOSIT: "מקדמה", BALANCE: "יתרה", FULL: "תשלום מלא" };
const ENROLLMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "ממתין לתשלום",
  DEPOSIT_PAID: "מקדמה שולמה",
  PAID: "שולם במלואו",
  CANCELLED: "בוטל",
  FAILED: "נכשל",
};
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
        <h1 className="font-display text-2xl font-bold text-white">{enrollment.enrollmentNumber}</h1>
        <AdminEnrollmentStatusBadge status={enrollment.status} />
      </div>

      <Card className="mt-4">
        <CardContent className="p-4">
          <EnrollmentStatusForm enrollmentNumber={enrollment.enrollmentNumber} currentStatus={enrollment.status} />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-neutral-400">קורס</dt>
            <dd className="text-white">{enrollment.courseNameHeSnapshot}</dd>
          </div>
          <div>
            <dt className="text-sm text-neutral-400">לקוח</dt>
            <dd className="text-white">{enrollment.customerName}</dd>
          </div>
          <div>
            <dt className="text-sm text-neutral-400">אימייל</dt>
            <dd className="text-white">{enrollment.customerEmail}</dd>
          </div>
          <div>
            <dt className="text-sm text-neutral-400">טלפון</dt>
            <dd className="text-white">{enrollment.customerPhone}</dd>
          </div>
          <div>
            <dt className="text-sm text-neutral-400">משתמש רשום</dt>
            <dd className="text-white">{enrollment.user?.email ?? "אורח"}</dd>
          </div>
          <div>
            <dt className="text-sm text-neutral-400">מחיר / שולם / יתרה</dt>
            <dd className="text-white">
              {formatAgorot(enrollment.coursePriceAgorot, "he")} · {formatAgorot(enrollment.amountPaidAgorot, "he")} ·{" "}
              <span className="text-accent">{formatAgorot(balance, "he")}</span>
            </dd>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="p-5">
          <h2 className="text-sm font-medium text-neutral-300">תשלומים</h2>
          <div className="mt-3 space-y-2">
            {enrollment.payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span className="text-neutral-300">
                  {KIND_LABELS[p.kind] ?? p.kind} · {formatAgorot(p.amountAgorot, "he")}
                </span>
                <span className="text-neutral-400">{PAYMENT_STATUS_LABELS[p.status] ?? p.status}</span>
              </div>
            ))}
            {enrollment.payments.length === 0 && <p className="text-sm text-neutral-400">אין תשלומים.</p>}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="p-5">
          <h2 className="text-sm font-medium text-neutral-300">היסטוריית סטטוס</h2>
          <div className="mt-4">
            <StatusHistory events={enrollment.statusEvents} labels={ENROLLMENT_STATUS_LABELS} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
