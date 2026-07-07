import { ChevronLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/shop/order-status-badge";
import { formatAgorot } from "@/lib/format";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";

const IN_PROGRESS_STATUSES = new Set(["PENDING", "PAID", "FULFILLED"]);

/** כרטיס "הזמנות אחרונות" — ux-spec.md §A2 סעיף 1 (span 2). */
export async function RecentOrdersCard({ userId, locale }: { userId: string; locale: string }) {
  const t = await getTranslations({ locale, namespace: "account.dashboard.recentOrders" });

  const orders = await db.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return (
    <Card className="lg:order-1 lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-base font-medium text-white">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="flex flex-col items-start gap-4 py-4">
            <p className="text-sm text-neutral-400">{t("empty")}</p>
            <Link href="/shop" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              {t("emptyCta")}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.orderNumber}`}
                className="flex items-center justify-between gap-4 rounded-lg border border-line-dark bg-ink/40 p-3 transition-colors hover:border-accent"
              >
                <div>
                  <p className="text-sm font-medium text-white">{order.orderNumber}</p>
                  <p className="text-xs text-neutral-400">{new Date(order.createdAt).toLocaleDateString(locale)}</p>
                  {IN_PROGRESS_STATUSES.has(order.status) && (
                    <span className="mt-1 inline-block text-xs text-accent">{t("trackOrder")}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-neutral-300">{formatAgorot(order.totalAgorot, locale)}</span>
                  <OrderStatusBadge status={order.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
      {orders.length > 0 && (
        <CardFooter>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-1 text-sm text-neutral-400 transition-colors hover:text-white"
          >
            {t("viewAll")}
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
