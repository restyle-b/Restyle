import { Link } from "@/i18n/navigation";
import { ProductImage } from "@/components/shop/product-image";
import { formatAgorot } from "@/lib/format";
import type { ProductItem } from "@/lib/content/get-products";

export function ProductCard({
  product,
  locale,
  outOfStockLabel,
}: {
  product: ProductItem;
  locale: string;
  outOfStockLabel: string;
}) {
  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group block overflow-hidden rounded-lg border border-line-dark bg-ink-soft transition-colors hover:border-accent/50"
    >
      <ProductImage
        imageUrl={product.imageUrl}
        label={product.name}
        className="aspect-square w-full rounded-t-lg object-cover"
      />
      <div className="p-4">
        <h2 className="font-display text-base font-bold text-white">{product.name}</h2>
        <p className="mt-1 line-clamp-2 text-sm text-neutral-400">{product.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-accent">
            {formatAgorot(product.priceAgorot, locale)}
          </span>
          {product.stock <= 0 && <span className="text-xs text-neutral-500">{outOfStockLabel}</span>}
        </div>
      </div>
    </Link>
  );
}
