import { Link } from "@/i18n/navigation";
import { ProductImage } from "@/components/shop/product-image";
import { formatAgorot } from "@/lib/format";
import type { ProductItem } from "@/lib/content/get-products";

/**
 * כרטיס מוצר — editorial מינימלי בהשראת menspire: תמונה portrait גדולה
 * (4:5) עם זום עדין ב-hover, כותרת uppercase, מחיר ב-accent. בלי מסגרת
 * כבדה — הצ'רום מינימלי, התמונה נושאת את הכרטיס. ראה docs/DESIGN.md.
 */
export function ProductCard({
  product,
  locale,
  outOfStockLabel,
}: {
  product: ProductItem;
  locale: string;
  outOfStockLabel: string;
}) {
  const soldOut = product.stock <= 0;

  return (
    <Link href={`/shop/${product.slug}`} className="group block">
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
        <p className="mt-2 text-sm font-semibold text-accent">
          {formatAgorot(product.priceAgorot, locale)}
        </p>
      </div>
    </Link>
  );
}
