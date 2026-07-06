import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPromotion, getPromotionRedemptions } from "@/server/actions/admin/promotions";
import { CouponsTable } from "@/components/admin/coupons-table";
import { Breadcrumb } from "@/components/admin/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { bpToPercentInput } from "@/lib/admin/promotion-schema";
import { utcToJerusalemLocal } from "@/lib/admin/product-schema";
import { formatAgorot } from "@/lib/format";

export const metadata: Metadata = { title: "פרטי מבצע | ניהול" };
export const dynamic = "force-dynamic";

const KIND_LABELS: Record<string, string> = {
  PERCENT: "אחוז הנחה",
  FIXED_AMOUNT: "סכום קבוע",
  FREE_SHIPPING: "משלוח חינם",
  BUY_X_GET_Y: "קנה-קבל (בקרוב)",
  CHEAPEST_FREE: "הזול חינם (בקרוב)",
  BUNDLE_PRICE: "מחיר חבילה (בקרוב)",
};

function benefitSummary(promotion: {
  kind: string;
  percentBp: number | null;
  amountAgorot: number | null;
  freeShippingMinSubtotalAgorot: number | null;
}): string {
  switch (promotion.kind) {
    case "PERCENT":
      return promotion.percentBp ? `${bpToPercentInput(promotion.percentBp)}% הנחה` : "—";
    case "FIXED_AMOUNT":
      return promotion.amountAgorot ? `${formatAgorot(promotion.amountAgorot, "he")} הנחה` : "—";
    case "FREE_SHIPPING":
      return promotion.freeShippingMinSubtotalAgorot
        ? `משלוח חינם מעל ${formatAgorot(promotion.freeShippingMinSubtotalAgorot, "he")}`
        : "משלוח חינם ללא סף";
    default:
      return "—";
  }
}

export default async function AdminPromotionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [promotion, redemptions] = await Promise.all([getPromotion(id), getPromotionRedemptions(id)]);
  if (!promotion) notFound();

  return (
    <div className="max-w-4xl">
      <Breadcrumb items={[{ label: "מבצעים וקופונים", href: "/admin/promotions" }, { label: promotion.name }]} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-white">{promotion.name}</h1>
        <div className="flex gap-2">
          <Badge tone={promotion.active ? "success" : "neutral"}>{promotion.active ? "פעיל" : "כבוי"}</Badge>
          <Badge tone={promotion.automatic ? "info" : "purple"}>{promotion.automatic ? "אוטומטי" : "קופון"}</Badge>
        </div>
      </div>

      <Card className="mt-4">
        <CardContent className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-neutral-400">סוג</dt>
            <dd className="text-white">{KIND_LABELS[promotion.kind] ?? promotion.kind}</dd>
          </div>
          <div>
            <dt className="text-sm text-neutral-400">הטבה</dt>
            <dd className="text-white">{benefitSummary(promotion)}</dd>
          </div>
          <div>
            <dt className="text-sm text-neutral-400">חל על</dt>
            <dd className="text-white">{promotion.appliesTo === "SHOP" ? "חנות" : "קורסים (בקרוב)"}</dd>
          </div>
          <div>
            <dt className="text-sm text-neutral-400">סכום מינימום</dt>
            <dd className="text-white">
              {promotion.minSubtotalAgorot ? formatAgorot(promotion.minSubtotalAgorot, "he") : "ללא סף"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-neutral-400">חל גם על פריטי מבצע</dt>
            <dd className="text-white">{promotion.appliesToSaleItems ? "כן" : "לא"}</dd>
          </div>
          <div>
            <dt className="text-sm text-neutral-400">תוקף</dt>
            <dd className="text-white">
              {promotion.startsAt ? utcToJerusalemLocal(promotion.startsAt) : "מיידי"}
              {" – "}
              {promotion.endsAt ? utcToJerusalemLocal(promotion.endsAt) : "ללא הגבלה"}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-neutral-400">זכאות מוגבלת</dt>
            <dd className="text-white">
              {promotion.eligibleProducts.length === 0 && promotion.eligibleCategories.length === 0
                ? "כל העגלה"
                : `${promotion.eligibleProducts.length} מוצרים, ${promotion.eligibleCategories.length} קטגוריות`}
            </dd>
          </div>
          {promotion.description && (
            <div className="sm:col-span-2">
              <dt className="text-sm text-neutral-400">תיאור פנימי</dt>
              <dd className="text-white">{promotion.description}</dd>
            </div>
          )}
        </CardContent>
      </Card>

      {!promotion.automatic && (
        <Card className="mt-6">
          <CardContent className="p-5">
            <h2 className="text-sm font-medium text-neutral-300">קופונים</h2>
            <div className="mt-4">
              <CouponsTable promotionId={promotion.id} coupons={promotion.coupons} />
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardContent className="p-5">
          <h2 className="text-sm font-medium text-neutral-300">מימושים אחרונים</h2>
          <div className="mt-4 space-y-2">
            {redemptions && redemptions.length > 0 ? (
              redemptions.map((r) => (
                <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <Link href={`/admin/orders/${r.order.orderNumber}`} className="text-neutral-300 hover:underline">
                    {r.order.orderNumber} · {r.order.customerName}
                  </Link>
                  <span className="text-neutral-400">
                    קוד {r.coupon.code} · הנחה {formatAgorot(r.discountAgorot, "he")}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-neutral-400">
                {promotion.automatic
                  ? "מבצעים אוטומטיים לא נספרים כמימושים בשלב זה."
                  : "אין עדיין מימושים לקופונים של מבצע זה."}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
