"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ProductImage } from "@/components/shop/product-image";
import { formatAgorot } from "@/lib/format";
import { getRecentlyViewed, type RecentlyViewedItem } from "@/lib/account/recently-viewed";

/**
 * "נצפו לאחרונה" — localStorage בלבד (לא DB, לא דורש שאילתת שרת). מוסתר
 * לגמרי כשהרשימה ריקה (משתמש חדש/דפדפן פרטי) — ux-spec.md §A2 סעיף 7.
 * client-only מטבעו (אין גישה ל-localStorage בשרת), לכן לא חלק מה-Suspense
 * server-streaming של שאר הכרטיסים.
 */
export function RecentlyViewedRail() {
  const t = useTranslations("account.dashboard.recentlyViewed");
  const locale = useLocale();
  const [items, setItems] = useState<RecentlyViewedItem[] | null>(null);

  useEffect(() => {
    setItems(getRecentlyViewed());
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <Card className="lg:order-7 lg:col-span-3">
      <CardHeader>
        <CardTitle className="text-base font-medium text-white">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex snap-x gap-4 overflow-x-auto pb-2">
          {items.map((item) => (
            <Link
              key={item.productId}
              href={`/shop/${item.slug}`}
              className="w-32 shrink-0 snap-start sm:w-40"
            >
              <div className="aspect-[4/5] overflow-hidden rounded-lg bg-ink-soft">
                <ProductImage imageUrl={item.imageUrl} label={item.name} className="h-full w-full object-cover" />
              </div>
              <p className="mt-2 truncate text-xs font-medium text-white">{item.name}</p>
              <p className="text-xs text-accent">{formatAgorot(item.priceAgorot, locale)}</p>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
