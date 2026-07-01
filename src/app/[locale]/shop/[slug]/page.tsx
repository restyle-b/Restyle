import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { ProductImage } from "@/components/shop/product-image";
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

  return (
    <Container className="py-20">
      <div className="grid gap-10 lg:grid-cols-2">
        <ProductImage
          imageUrl={product.imageUrl}
          label={product.name}
          className="aspect-square w-full rounded-lg object-cover"
        />
        <div>
          <h1 className="font-display text-2xl font-bold text-white">{product.name}</h1>
          <p className="mt-4 text-neutral-300">{product.description}</p>
          <p className="mt-6 text-xl font-semibold text-accent">
            {formatAgorot(product.priceAgorot, locale)}
          </p>
          {product.stock <= 0 && (
            <p className="mt-2 text-sm text-neutral-500">{t("outOfStock")}</p>
          )}
        </div>
      </div>
    </Container>
  );
}
