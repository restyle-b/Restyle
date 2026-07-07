"use client";

import { useLocale, useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/section-heading";
import { Link } from "@/i18n/navigation";
import { ProductImage } from "@/components/shop/product-image";
import { buttonVariants } from "@/components/ui/button";
import { useCart } from "@/lib/cart/cart-context";
import { formatAgorot } from "@/lib/format";
import { cn } from "@/lib/utils";

const MAX_QUANTITY = 99;

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
          <Link href="/shop" className={cn(buttonVariants({ size: "lg", variant: "light" }), "mt-6")}>
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
                  <div
                    role="group"
                    aria-label={t("quantityLabel")}
                    className="flex items-center gap-1 rounded-full border border-line-dark px-1 py-1"
                  >
                    <button
                      type="button"
                      onClick={() => setQuantity(item.productId, item.quantity - 1)}
                      aria-label={t("decreaseQuantity")}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-300 transition-colors hover:bg-current/10 hover:text-accent"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm font-medium text-white">{item.quantity}</span>
                    <button
                      type="button"
                      disabled={item.quantity >= MAX_QUANTITY}
                      onClick={() => setQuantity(item.productId, item.quantity + 1)}
                      aria-label={t("increaseQuantity")}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-300 transition-colors hover:bg-current/10 hover:text-accent disabled:pointer-events-none disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    aria-label={t("remove")}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-white/10 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
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
            className={cn(buttonVariants({ size: "lg", variant: "light" }), "w-full justify-center")}
          >
            {t("checkoutCta")}
          </Link>
        </div>
      )}
    </Container>
  );
}
