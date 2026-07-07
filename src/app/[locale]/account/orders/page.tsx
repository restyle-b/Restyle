import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/section-heading";
import { Link } from "@/i18n/navigation";
import { OrderStatusBadge } from "@/components/shop/order-status-badge";
import { formatAgorot } from "@/lib/format";
import { getCurrentUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import type { Order } from "@prisma/client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "orders" });
  return { title: t("title") };
}

// תלוי ב-cookies()/Supabase לכל בקשה — אסור רינדור סטטי בזמן build.
export const dynamic = "force-dynamic";

const IN_PROGRESS_STATUSES = ["PENDING", "PAID", "FULFILLED"] as const;

export default async function AccountOrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "orders" });

  // ה-layout כבר מבטיח משתמש מחובר; קריאה נוספת פה רק כדי לקבל את ה-id
  // (הגנה כפולה קלה — לא מוסיפים redirect משוכפל, ה-layout כבר עשה זאת).
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/account/orders");
  }

  const orders = await db.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const inProgress = orders.filter((o) => (IN_PROGRESS_STATUSES as readonly string[]).includes(o.status));
  const completed = orders.filter((o) => !(IN_PROGRESS_STATUSES as readonly string[]).includes(o.status));

  return (
    <>
      <SectionHeading light eyebrow={t("title")} title={t("title")} />

      {orders.length === 0 ? (
        <p className="mt-10 text-neutral-400">{t("emptyState")}</p>
      ) : (
        <div className="mt-10 space-y-10">
          <OrderGroup title={t("inProgressTitle")} orders={inProgress} locale={locale} />
          <OrderGroup title={t("completedTitle")} orders={completed} locale={locale} />
        </div>
      )}

      <Link href="/account" className="mt-10 inline-block text-sm text-neutral-400 hover:text-white">
        {t("backToAccount")}
      </Link>
    </>
  );
}

function OrderGroup({
  title,
  orders,
  locale,
}: {
  title: string;
  orders: Order[];
  locale: string;
}) {
  if (orders.length === 0) return null;
  return (
    <div>
      <h2 className="font-display text-lg font-semibold text-white">{title}</h2>
      <div className="mt-4 space-y-3">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/account/orders/${order.orderNumber}`}
            className="flex items-center justify-between gap-4 rounded-lg border border-line-dark bg-ink-soft p-4 hover:border-accent"
          >
            <div>
              <p className="font-medium text-white">{order.orderNumber}</p>
              <p className="text-sm text-neutral-400">
                {new Date(order.createdAt).toLocaleDateString(locale)}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-neutral-300">{formatAgorot(order.totalAgorot, locale)}</span>
              <OrderStatusBadge status={order.status} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
