"use client";

import { useLocale, useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/section-heading";
import { Link } from "@/i18n/navigation";
import { ProductImage } from "@/components/shop/product-image";
import { buttonVariants } from "@/components/ui/button";
import { useCart } from "@/lib/cart/cart-context";
import { formatAgorot } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function CartPage() {
  const locale = useLocale();
  const t = useTranslations("cart");
  const { items, removeItem, setQuantity, subtotalAgorot } = useCart();

  return (
    <Container className="py-20">
      <SectionHeading light eyebrow={t("title")} title={t("title")} />

      {items.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-neutral-400">{t("empty")}</p>
          <Link href="/shop" className={cn(buttonVariants({ size: "lg" }), "mt-6")}>
            {t("continueShopping")}
          </Link>
        </div>
      ) : (
        <div className="mt-10 max-w-2xl space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex items-center gap-4 rounded-lg border border-line-dark bg-ink-soft p-4"
            >
              <ProductImage
                imageUrl={item.imageUrl}
                label={item.name}
                className="h-20 w-20 shrink-0 rounded-md object-cover"
              />
              <div className="flex-1">
                <Link href={`/shop/${item.slug}`} className="font-medium text-white hover:underline">
                  {item.name}
                </Link>
                <p className="mt-1 text-sm text-neutral-400">
                  {formatAgorot(item.priceAgorot, locale)}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <label htmlFor={`qty-${item.productId}`} className="sr-only">
                    {t("quantityLabel")}
                  </label>
                  <input
                    id={`qty-${item.productId}`}
                    type="number"
                    min={1}
                    max={99}
                    value={item.quantity}
                    onChange={(e) => setQuantity(item.productId, Number(e.target.value))}
                    className="w-16 rounded-md border border-line-dark bg-ink px-2 py-1 text-sm text-white"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="text-sm text-neutral-400 hover:text-white"
                  >
                    {t("remove")}
                  </button>
                </div>
              </div>
              <p className="font-semibold text-accent">
                {formatAgorot(item.priceAgorot * item.quantity, locale)}
              </p>
            </div>
          ))}

          <div className="flex items-center justify-between border-t border-line-dark pt-4">
            <span className="text-lg font-medium text-white">{t("subtotal")}</span>
            <span className="text-lg font-semibold text-accent">
              {formatAgorot(subtotalAgorot, locale)}
            </span>
          </div>

          <Link
            href="/checkout"
            className={cn(buttonVariants({ size: "lg" }), "w-full justify-center")}
          >
            {t("checkoutCta")}
          </Link>
        </div>
      )}
    </Container>
  );
}
