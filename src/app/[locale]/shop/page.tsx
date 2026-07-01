import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/section-heading";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "@/components/shop/product-card";
import { getProducts } from "@/lib/content/get-products";
import { getCategories } from "@/lib/content/get-categories";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "shop" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function ShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale } = await params;
  const { category } = await searchParams;
  const t = await getTranslations({ locale, namespace: "shop" });
  const [categories, products] = await Promise.all([
    getCategories(locale),
    getProducts(locale, category),
  ]);

  return (
    <Container className="py-20">
      <SectionHeading light eyebrow={t("eyebrow")} title={t("title")} />

      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          href="/shop"
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm transition-colors",
            !category
              ? "border-accent bg-accent text-ink"
              : "border-line-dark text-neutral-300 hover:bg-ink",
          )}
        >
          {t("allCategories")}
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={{ pathname: "/shop", query: { category: c.slug } }}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition-colors",
              category === c.slug
                ? "border-accent bg-accent text-ink"
                : "border-line-dark text-neutral-300 hover:bg-ink",
            )}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {products.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              locale={locale}
              outOfStockLabel={t("outOfStock")}
            />
          ))}
        </div>
      ) : (
        <p className="mt-12 text-center text-neutral-400">{t("emptyState")}</p>
      )}
    </Container>
  );
}
