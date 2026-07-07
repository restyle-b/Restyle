import Link from "next/link";
import { getDashboardStats, getDashboardOverview } from "@/server/actions/admin/dashboard";
import { listActivity } from "@/server/actions/admin/activity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ActivityTimeline } from "@/components/admin/activity/activity-timeline";
import { RevenueChart } from "@/components/admin/dashboard/revenue-chart";
import { TopProductsChart } from "@/components/admin/dashboard/top-products-chart";
import { formatAgorot } from "@/lib/format";
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
  const [stats, overview, activity] = await Promise.all([
    getDashboardStats(),
    getDashboardOverview(),
    listActivity({ limit: 5 }),
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">דשבורד</h1>
          <p className="mt-1 text-sm text-neutral-400">סקירה מהירה של המצב הנוכחי ומעבר לכל מסכי הניהול.</p>
        </div>
      </div>

      {/* KPI row — הכנסות/הזמנות/AOV/מלאי נמוך, עם דלתא מול התקופה הקודמת (B1 ב-ux-spec) */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard
          label="הכנסות היום"
          value={formatAgorot(overview.revenue.today.agorot, "he")}
          href="/admin/orders"
          deltaPercent={overview.revenue.today.deltaPercent}
        />
        <StatCard
          label="הכנסות (7 ימים)"
          value={formatAgorot(overview.revenue.last7d.agorot, "he")}
          href="/admin/orders"
          deltaPercent={overview.revenue.last7d.deltaPercent}
        />
        <StatCard
          label="הכנסות (30 יום)"
          value={formatAgorot(overview.revenue.last30d.agorot, "he")}
          href="/admin/orders"
          deltaPercent={overview.revenue.last30d.deltaPercent}
        />
        <StatCard
          label="הזמנות (30 יום)"
          value={overview.orders30d.count}
          href="/admin/orders"
          deltaPercent={overview.orders30d.deltaPercent}
        />
        <StatCard
          label="שווי הזמנה ממוצע"
          value={overview.aov30d.agorot === null ? "—" : formatAgorot(overview.aov30d.agorot, "he")}
          href="/admin/orders"
          deltaPercent={overview.aov30d.agorot === null ? undefined : overview.aov30d.deltaPercent}
          tooltip={overview.aov30d.agorot === null ? "ממוצע יחושב לאחר ההזמנה הראשונה." : undefined}
        />
        <StatCard
          label="מלאי נמוך"
          value={overview.lowStockCount}
          href="/admin/products?stock=low"
          highlight={overview.lowStockCount > 0}
        />
      </div>

      {/* גרפים — הכנסה לאורך זמן + מוצרים מובילים, SVG ידני מונוכרומטי (החלטה #10) */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>הכנסות לאורך זמן (30 יום)</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={overview.dailyRevenue30d} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>מוצרים מובילים (30 יום)</CardTitle>
          </CardHeader>
          <CardContent>
            <TopProductsChart products={overview.topProducts} />
          </CardContent>
        </Card>
      </div>

      {/* פעילות אחרונה — הטמעת ActivityTimeline הקיים, limit=5 */}
      <div className="mt-6">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>פעילות אחרונה</CardTitle>
            <Link href="/admin/activity" className="text-xs text-neutral-400 hover:text-white">
              לכל הפעילות ←
            </Link>
          </CardHeader>
          <CardContent>
            {activity.events.length === 0 ? (
              <p className="py-4 text-center text-sm text-neutral-400">אין פעילות להצגה עדיין.</p>
            ) : (
              <ActivityTimeline events={activity.events} />
            )}
          </CardContent>
        </Card>
      </div>

      <h2 className="mt-10 text-sm font-medium text-neutral-400">עוד במבט מהיר</h2>
      <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
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
        <StatCard label="לקוחות רשומים" value={overview.customersCount} href="/admin/orders" />
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

/** קו דלתא מתחת לערך ה-KPI — מחושב בהשוואה לתקופה הקודמת (7 ימים→7 ימים וכו'). */
function DeltaLine({ deltaPercent }: { deltaPercent: number }) {
  if (deltaPercent === 0) {
    return <div className="mt-1 text-[11px] text-neutral-500">ללא שינוי מהתקופה הקודמת</div>;
  }
  const isUp = deltaPercent > 0;
  return (
    <div className={cn("mt-1 text-[11px] [font-variant-numeric:tabular-nums]", isUp ? "text-green-400" : "text-red-400")}>
      {isUp ? "↑" : "↓"} {Math.abs(deltaPercent)}% מהתקופה הקודמת
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
  highlight,
  deltaPercent,
  tooltip,
}: {
  label: string;
  value: React.ReactNode;
  href: string;
  highlight?: boolean;
  /** undefined = לא מציגים שורת דלתא כלל; null = אין בסיס להשוואה (גם לא מוצג). */
  deltaPercent?: number | null;
  /** כשמוגדר, הערך עטוף ב-tooltip (למשל AOV כש-value הוא "—"). */
  tooltip?: string;
}) {
  const valueNode = (
    <div className={cn("text-2xl font-bold [font-variant-numeric:tabular-nums]", highlight ? "text-accent" : "text-white")}>
      {value}
    </div>
  );

  return (
    <Link href={href}>
      <Card
        className={cn(
          "h-full transition-colors hover:border-accent/60",
          highlight && "border-accent/60 bg-accent/10",
        )}
      >
        <CardContent className="p-4">
          {tooltip ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <div>{valueNode}</div>
              </TooltipTrigger>
              <TooltipContent>{tooltip}</TooltipContent>
            </Tooltip>
          ) : (
            valueNode
          )}
          <div className="mt-1 text-xs text-neutral-400">{label}</div>
          {typeof deltaPercent === "number" && <DeltaLine deltaPercent={deltaPercent} />}
        </CardContent>
      </Card>
    </Link>
  );
}
