import { ChevronLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { ProductCard } from "@/components/shop/product-card";
import { getWishlistProducts } from "@/lib/account/wishlist";

/** כרטיס "המועדפים שלי" — ux-spec.md §A2 סעיף 5 (span 2, 3-4 כרטיסים, לב מלא). */
export async function WishlistPreviewCard({ userId, locale }: { userId: string; locale: string }) {
  const t = await getTranslations({ locale, namespace: "account.dashboard.wishlist" });
  const tShop = await getTranslations({ locale, namespace: "shop" });

  const products = await getWishlistProducts(userId, locale, 4);

  return (
    <Card className="lg:order-4 lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-base font-medium text-white">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <p className="py-4 text-sm text-neutral-400">{t("empty")}</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                locale={locale}
                outOfStockLabel={tShop("outOfStock")}
                wishlisted
              />
            ))}
          </div>
        )}
      </CardContent>
      {products.length > 0 && (
        <CardFooter>
          <Link
            href="/account/wishlist"
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
