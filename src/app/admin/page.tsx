import Link from "next/link";
import { getDashboardStats } from "@/server/actions/admin/dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// תלוי ב-cookies()/Supabase דרך requireAdmin — אסור רינדור סטטי בזמן build.
export const dynamic = "force-dynamic";

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "ממתין לתשלום",
  PAID: "שולם",
  FULFILLED: "מוכן/נשלח",
  COMPLETED: "הושלם",
  CANCELLED: "בוטל",
  FAILED: "נכשל",
};

const ENROLLMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "ממתין לתשלום",
  DEPOSIT_PAID: "מקדמה שולמה",
  PAID: "שולם במלואו",
  CANCELLED: "בוטל",
  FAILED: "נכשל",
};

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">דשבורד</h1>
          <p className="mt-1 text-sm text-neutral-400">סקירה מהירה של המצב הנוכחי ומעבר לכל מסכי הניהול.</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard
          label="הזמנות ממתינות"
          value={stats.pendingOrders}
          href="/admin/orders?status=PENDING"
          highlight={stats.pendingOrders > 0}
        />
        <StatCard
          label="הרשמות ממתינות"
          value={stats.pendingEnrollments}
          href="/admin/enrollments?status=PENDING"
          highlight={stats.pendingEnrollments > 0}
        />
        <StatCard label="סה&quot;כ הזמנות" value={stats.ordersTotal} href="/admin/orders" />
        <StatCard label="סה&quot;כ הרשמות לקורסים" value={stats.enrollmentsTotal} href="/admin/enrollments" />
        <StatCard label="מוצרים פעילים" value={stats.products} href="/admin/products" />
        <StatCard label="קטגוריות פעילות" value={stats.categories} href="/admin/categories" />
        <StatCard label="קורסים פעילים" value={stats.courses} href="/admin/courses" />
        <StatCard label="המלצות פעילות" value={stats.testimonials} href="/admin/testimonials" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <StatusBreakdown
          title="הזמנות לפי סטטוס"
          basePath="/admin/orders"
          counts={stats.ordersByStatus}
          labels={ORDER_STATUS_LABELS}
        />
        <StatusBreakdown
          title="הרשמות לקורסים לפי סטטוס"
          basePath="/admin/enrollments"
          counts={stats.enrollmentsByStatus}
          labels={ENROLLMENT_STATUS_LABELS}
        />
      </div>
    </div>
  );
}

function StatusBreakdown({
  title,
  basePath,
  counts,
  labels,
}: {
  title: string;
  basePath: string;
  counts: Record<string, number>;
  labels: Record<string, string>;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <h2 className="text-sm font-medium text-neutral-300">{title}</h2>
        <ul className="mt-3 space-y-1">
          {Object.entries(labels).map(([status, label]) => (
            <li key={status}>
              <Link
                href={`${basePath}?status=${status}`}
                className="flex items-center justify-between rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-white/5"
              >
                <span className="text-neutral-300">{label}</span>
                <Badge tone="outline">{counts[status] ?? 0}</Badge>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function StatCard({
  label,
  value,
  href,
  highlight,
}: {
  label: string;
  value: number;
  href: string;
  highlight?: boolean;
}) {
  return (
    <Link href={href}>
      <Card
        className={cn(
          "h-full transition-colors hover:border-accent/60",
          highlight && "border-accent/60 bg-accent/10",
        )}
      >
        <CardContent className="p-4">
          <div className={cn("text-2xl font-bold [font-variant-numeric:tabular-nums]", highlight ? "text-accent" : "text-white")}>
            {value}
          </div>
          <div className="mt-1 text-xs text-neutral-400">{label}</div>
        </CardContent>
      </Card>
    </Link>
  );
}
