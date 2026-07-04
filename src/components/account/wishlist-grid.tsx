"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "@/components/shop/product-card";
import { buttonVariants } from "@/components/ui/button";
import { toggleWishlistItem } from "@/server/actions/account/wishlist";
import { cn } from "@/lib/utils";
import type { ProductItem } from "@/lib/content/get-products";

/**
 * גריד המועדפים — un-heart מסיר את הכרטיס אופטימית (לא רק מרוקן את הלב)
 * ומציג טוסט undo (sonner action button) שמחזיר את הכרטיס למקומו + טוגל
 * חוזר בשרת. ראה ux-spec.md §A5.
 */
export function WishlistGrid({
  initialProducts,
  outOfStockLabel,
}: {
  initialProducts: ProductItem[];
  outOfStockLabel: string;
}) {
  const t = useTranslations("account.wishlist");
  const locale = useLocale();
  const [products, setProducts] = useState(initialProducts);

  function handleRemoved(product: ProductItem, index: number) {
    setProducts((current) => current.filter((p) => p.id !== product.id));
    toast(t("removedToast"), {
      action: {
        label: t("undoCta"),
        onClick: () => {
          setProducts((current) => {
            if (current.some((p) => p.id === product.id)) return current;
            const next = [...current];
            next.splice(Math.min(index, next.length), 0, product);
            return next;
          });
          void toggleWishlistItem(product.id, locale).then((result) => {
            if (!result.ok || !result.wishlisted) {
              // הוספה חוזרת נכשלה (מרוץ/שגיאת רשת) — מסירים שוב בשקט, המשתמש
              // כבר קיבל את ה-undo האופטימי; אין ערך בהצגת עוד שגיאה כאן.
              setProducts((current) => current.filter((p) => p.id !== product.id));
            }
          });
        },
      },
    });
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <Heart className="h-10 w-10 text-neutral-600" aria-hidden="true" />
        <div>
          <p className="text-lg font-medium text-white">{t("empty")}</p>
          <p className="mt-1 text-sm text-neutral-400">{t("emptyDescription")}</p>
        </div>
        <Link href="/shop" className={cn(buttonVariants({ variant: "light" }))}>
          {t("emptyCta")}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          locale={locale}
          outOfStockLabel={outOfStockLabel}
          wishlisted
          onWishlistToggled={(wishlisted) => {
            if (!wishlisted) handleRemoved(product, index);
          }}
        />
      ))}
    </div>
  );
}
