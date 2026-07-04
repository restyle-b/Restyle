import { Link } from "@/i18n/navigation";
import { ProductImage } from "@/components/shop/product-image";
import { ProductCardCartControl } from "@/components/shop/product-card-cart-control";
import { WishlistHeartButton } from "@/components/shop/wishlist-heart-button";
import { formatAgorot } from "@/lib/format";
import type { ProductItem } from "@/lib/content/get-products";

/**
 * כרטיס מוצר — editorial מינימלי בהשראת menspire: תמונה portrait גדולה
 * (4:5) עם זום עדין ב-hover, כותרת uppercase, מחיר ב-accent. בלי מסגרת
 * כבדה — הצ'רום מינימלי, התמונה נושאת את הכרטיס. ראה docs/DESIGN.md.
 * ה-Link עוטף רק את התמונה/כותרת/מחיר (ניווט לדף המוצר) — פקד העגלה ולב
 * המועדפים יושבים מחוצה לו כאחים (position:relative על "group" החיצוני),
 * כדי שהוספה לעגלה/סימון מועדף לא ינווטו בטעות. הלב יושב ב-top-3 start-3 —
 * הפינה הנגדית לתג "אזל מהמלאי" שב-top-3 end-3 בתוך תמונת המוצר.
 */
export function ProductCard({
  product,
  locale,
  outOfStockLabel,
  wishlisted = false,
}: {
  product: ProductItem;
  locale: string;
  outOfStockLabel: string;
  wishlisted?: boolean;
}) {
  const soldOut = product.stock <= 0 || !product.available;

  return (
    <div className="group relative">
      <WishlistHeartButton
        productId={product.id}
        initialWishlisted={wishlisted}
        className="absolute top-3 start-3 z-10"
      />
      <Link href={`/shop/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-ink-soft">
          <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100">
            <ProductImage imageUrl={product.imageUrl} label={product.name} className="h-full w-full object-cover" />
          </div>
          {/* הכהיה עדינה שנמסה ב-hover — עומק editorial */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 motion-reduce:transition-none" />
          {soldOut && (
            <span className="absolute top-3 end-3 rounded-full bg-ink/80 px-3 py-1 text-xs font-medium tracking-wide text-neutral-200 backdrop-blur">
              {outOfStockLabel}
            </span>
          )}
        </div>

        <div className="mt-4">
          <h3 className="font-display text-sm font-bold uppercase tracking-wide text-white transition-colors group-hover:text-accent">
            {product.name}
          </h3>
          <p className="mt-2 flex items-baseline gap-2 text-sm font-semibold text-accent">
            <span>{formatAgorot(product.effectivePriceAgorot, locale)}</span>
            {product.onSale && (
              <span className="text-xs font-normal text-neutral-500 line-through">
                {formatAgorot(product.priceAgorot, locale)}
              </span>
            )}
          </p>
        </div>
      </Link>

      {!soldOut && (
        <ProductCardCartControl
          productId={product.id}
          slug={product.slug}
          name={product.name}
          priceAgorot={product.effectivePriceAgorot}
          imageUrl={product.imageUrl}
        />
      )}
    </div>
  );
}
