import Link from "next/link";
import { getDashboardStats } from "@/server/actions/admin/dashboard";
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

const QUICK_LINKS = [
  { href: "/admin/settings", label: "הגדרות אתר" },
  { href: "/admin/courses", label: "קורסים" },
  { href: "/admin/testimonials", label: "המלצות" },
  { href: "/admin/gallery", label: "גלריה" },
  { href: "/admin/content", label: "טקסטי האתר" },
  { href: "/admin/products", label: "מוצרים" },
  { href: "/admin/categories", label: "קטגוריות" },
  { href: "/admin/orders", label: "הזמנות" },
  { href: "/admin/enrollments", label: "הרשמות לקורסים" },
] as const;

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div>
      <h1 className="text-2xl font-semibold">דשבורד</h1>
      <p className="mt-2 text-neutral-400">סקירה מהירה ומעבר לכל מסכי הניהול.</p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile
          label="הזמנות ממתינות"
          value={stats.pendingOrders}
          href="/admin/orders?status=PENDING"
          highlight={stats.pendingOrders > 0}
        />
        <StatTile
          label="הרשמות ממתינות"
          value={stats.pendingEnrollments}
          href="/admin/enrollments?status=PENDING"
          highlight={stats.pendingEnrollments > 0}
        />
        <StatTile label="סה&quot;כ הזמנות" value={stats.ordersTotal} href="/admin/orders" />
        <StatTile label="סה&quot;כ הרשמות לקורסים" value={stats.enrollmentsTotal} href="/admin/enrollments" />
        <StatTile label="קורסים פעילים" value={stats.courses} href="/admin/courses" />
        <StatTile label="מוצרים פעילים" value={stats.products} href="/admin/products" />
        <StatTile label="קטגוריות פעילות" value={stats.categories} href="/admin/categories" />
        <StatTile label="המלצות פעילות" value={stats.testimonials} href="/admin/testimonials" />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
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

      <h2 className="mt-10 text-lg font-semibold">כל המסכים</h2>
      <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {QUICK_LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="block rounded-md border border-line-dark px-4 py-3 text-sm text-neutral-300 transition-colors hover:border-accent hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
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
    <div className="rounded-md border border-line-dark p-4">
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      <ul className="mt-3 space-y-1.5">
        {Object.entries(labels).map(([status, label]) => (
          <li key={status}>
            <Link
              href={`${basePath}?status=${status}`}
              className="flex items-center justify-between rounded px-2 py-1 text-sm text-neutral-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              <span>{label}</span>
              <span className="font-semibold text-white [font-variant-numeric:tabular-nums]">
                {counts[status] ?? 0}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatTile({
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
    <Link
      href={href}
      className={cn(
        "block rounded-md border px-4 py-4 transition-colors",
        highlight ? "border-accent bg-accent/10" : "border-line-dark hover:border-accent",
      )}
    >
      <div className={cn("text-2xl font-bold", highlight ? "text-accent" : "text-white")}>{value}</div>
      <div className="mt-1 text-xs text-neutral-400">{label}</div>
    </Link>
  );
}
