import { getTranslations } from "next-intl/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ProductCard } from "@/components/shop/product-card";
import { getProducts } from "@/lib/content/get-products";
import { getWishlistProductIds } from "@/lib/account/wishlist";

/**
 * "מוצרים מומלצים" — ux-spec.md §A2 סעיף 6, מסילה full-width. מקור: מוצרים
 * featured; אם אין (עדיין) מוצרים מסומנים featured, נופלים ל-4 הראשונים
 * מהקטלוג הפעיל, כדי שהכרטיס לא ייעלם סתם לגמרי בקטלוג חדש/קטן.
 */
export async function RecommendedRail({ userId, locale }: { userId: string; locale: string }) {
  const t = await getTranslations({ locale, namespace: "account.dashboard.recommended" });
  const tShop = await getTranslations({ locale, namespace: "shop" });

  const [allProducts, wishlistedIds] = await Promise.all([
    getProducts(locale),
    getWishlistProductIds(userId),
  ]);

  if (allProducts.length === 0) return null;

  const featured = allProducts.filter((p) => p.featured);
  const products = (featured.length > 0 ? featured : allProducts).slice(0, 8);

  return (
    <Card className="lg:order-6 lg:col-span-3">
      <CardHeader>
        <CardTitle className="text-base font-medium text-white">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex snap-x gap-4 overflow-x-auto pb-2">
          {products.map((product) => (
            <div key={product.id} className="w-40 shrink-0 snap-start sm:w-48">
              <ProductCard
                product={product}
                locale={locale}
                outOfStockLabel={tShop("outOfStock")}
                wishlisted={wishlistedIds.has(product.id)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
