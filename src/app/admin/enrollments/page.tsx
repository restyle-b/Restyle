import type { Metadata } from "next";
import Link from "next/link";
import type { EnrollmentStatus } from "@prisma/client";
import { listEnrollments, getEnrollmentsOverview } from "@/server/actions/admin/enrollments";
import { EnrollmentRow } from "@/components/admin/enrollments/enrollment-row";
import { Pagination } from "@/components/admin/pagination";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead } from "@/components/ui/table";
import { adminInputClass } from "@/lib/admin/form-styles";
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
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const { status, q, page: pageParam } = await searchParams;
  const statusFilter = STATUS_OPTIONS.includes(status as EnrollmentStatus)
    ? (status as EnrollmentStatus)
    : undefined;
  const page = Math.max(1, Number(pageParam) || 1);
  const [{ enrollments, total, pageSize }, overview] = await Promise.all([
    listEnrollments({ statusFilter, search: q, page }),
    getEnrollmentsOverview(),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">הרשמות לקורסים</h1>
      <p className="mt-1 text-sm text-neutral-400">{total} הרשמות בסינון הנוכחי.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-accent [font-variant-numeric:tabular-nums]">
              {overview.pendingCount}
            </div>
            <div className="mt-1 text-xs text-neutral-400">ממתינות לתשלום</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white [font-variant-numeric:tabular-nums]">
              {overview.todayEnrollments}
            </div>
            <div className="mt-1 text-xs text-neutral-400">הרשמות היום</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">{formatAgorot(overview.todayRevenueAgorot, "he")}</div>
            <div className="mt-1 text-xs text-neutral-400">נגבה היום</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">{formatAgorot(overview.avgEnrollmentAgorot, "he")}</div>
            <div className="mt-1 text-xs text-neutral-400">שווי הרשמה ממוצע</div>
          </CardContent>
        </Card>
      </div>

      <form method="get" className="mt-8 flex flex-wrap items-center gap-2">
        {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="חיפוש: מספר הרשמה, שם, אימייל או טלפון"
          className={cn(adminInputClass, "max-w-xs")}
        />
        <button type="submit" className="rounded-md border border-line-dark px-4 py-2 text-sm hover:border-accent">
          חיפוש
        </button>
        {q && (
          <Link
            href={statusFilter ? `/admin/enrollments?status=${statusFilter}` : "/admin/enrollments"}
            className="text-sm text-neutral-400 hover:text-white"
          >
            נקה חיפוש
          </Link>
        )}
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={q ? `/admin/enrollments?q=${encodeURIComponent(q)}` : "/admin/enrollments"}
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
            href={`/admin/enrollments?status=${s}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition-colors",
              statusFilter === s ? "border-accent bg-accent text-ink" : "border-line-dark text-neutral-300 hover:bg-ink-soft",
            )}
          >
            {STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      {enrollments.length === 0 ? (
        <p className="mt-8 text-center text-neutral-400">אין הרשמות בסינון זה.</p>
      ) : (
        <div className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>מספר הרשמה</TableHead>
                <TableHead>קורס / לקוח</TableHead>
                <TableHead>מסלול</TableHead>
                <TableHead>שולם / מחיר</TableHead>
                <TableHead>תאריך</TableHead>
                <TableHead>סטטוס</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollments.map((enrollment) => (
                <EnrollmentRow key={enrollment.id} enrollment={enrollment} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Pagination
        basePath="/admin/enrollments"
        params={{ status: statusFilter, q }}
        page={page}
        pageSize={pageSize}
        total={total}
      />
    </div>
  );
}
