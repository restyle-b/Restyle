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
    <Container className="py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <SectionHeading center light eyebrow={t("eyebrow")} title={t("title")} />
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-2">
        <Link
          href="/shop"
          className={cn(
            "rounded-full border px-5 py-2 text-sm tracking-wide transition-colors",
            !category
              ? "border-accent bg-accent text-ink"
              : "border-line-dark text-neutral-300 hover:border-accent/60 hover:text-white",
          )}
        >
          {t("allCategories")}
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={{ pathname: "/shop", query: { category: c.slug } }}
            className={cn(
              "rounded-full border px-5 py-2 text-sm tracking-wide transition-colors",
              category === c.slug
                ? "border-accent bg-accent text-ink"
                : "border-line-dark text-neutral-300 hover:border-accent/60 hover:text-white",
            )}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {products.length > 0 ? (
        <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-3 xl:grid-cols-4">
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
        <p className="mt-16 text-center text-neutral-400">{t("emptyState")}</p>
      )}
    </Container>
  );
}
