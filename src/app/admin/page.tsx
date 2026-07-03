import Link from "next/link";
import { getDashboardStats } from "@/server/actions/admin/dashboard";
import { cn } from "@/lib/utils";

// תלוי ב-cookies()/Supabase דרך requireAdmin — אסור רינדור סטטי בזמן build.
export const dynamic = "force-dynamic";

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
          href="/admin/orders"
          highlight={stats.pendingOrders > 0}
        />
        <StatTile
          label="הרשמות ממתינות"
          value={stats.pendingEnrollments}
          href="/admin/enrollments"
          highlight={stats.pendingEnrollments > 0}
        />
        <StatTile label="קורסים פעילים" value={stats.courses} href="/admin/courses" />
        <StatTile label="מוצרים פעילים" value={stats.products} href="/admin/products" />
        <StatTile label="קטגוריות פעילות" value={stats.categories} href="/admin/categories" />
        <StatTile label="המלצות פעילות" value={stats.testimonials} href="/admin/testimonials" />
        <StatTile label="תמונות גלריה פעילות" value={stats.galleryImages} href="/admin/gallery" />
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
