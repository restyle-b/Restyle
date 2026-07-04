import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/navigation";
import { ProductImage } from "@/components/shop/product-image";
import { AddToCartButton } from "@/components/shop/add-to-cart-button";
import { RecordRecentlyViewed } from "@/components/shop/record-recently-viewed";
import { formatAgorot } from "@/lib/format";
import { getProductBySlug } from "@/lib/content/get-products";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProductBySlug(locale, slug);
  if (!product) return {};
  return { title: product.name, description: product.description };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "shop" });
  const product = await getProductBySlug(locale, slug);
  if (!product) notFound();

  const inStock = product.stock > 0 && product.available;

  return (
    <Container className="py-20 sm:py-28">
      <RecordRecentlyViewed
        productId={product.id}
        slug={product.slug}
        name={product.name}
        imageUrl={product.imageUrl}
        priceAgorot={product.effectivePriceAgorot}
      />
      <Link
        href="/shop"
        className="link-underline text-sm text-neutral-400 transition-colors hover:text-white"
      >
        ← {t("backToShop")}
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="overflow-hidden bg-ink-soft">
          <ProductImage
            imageUrl={product.imageUrl}
            label={product.name}
            className="aspect-[4/5] w-full object-cover"
          />
        </div>

        <div className="flex flex-col justify-center">
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-white sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-6 flex items-baseline gap-3 text-2xl font-semibold text-accent">
            <span>{formatAgorot(product.effectivePriceAgorot, locale)}</span>
            {product.onSale && (
              <span className="text-base font-normal text-neutral-500 line-through">
                {formatAgorot(product.priceAgorot, locale)}
              </span>
            )}
          </p>
          <p className="mt-6 leading-relaxed text-neutral-300">{product.description}</p>

          <p className="mt-6 text-sm text-neutral-400">
            {inStock ? t("inStock") : t("outOfStock")}
          </p>

          <AddToCartButton
            productId={product.id}
            slug={product.slug}
            name={product.name}
            priceAgorot={product.effectivePriceAgorot}
            imageUrl={product.imageUrl}
            inStock={inStock}
          />
        </div>
      </div>
    </Container>
  );
}
