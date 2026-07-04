import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/section-heading";
import { WishlistGrid } from "@/components/account/wishlist-grid";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getWishlistProducts } from "@/lib/account/wishlist";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account.wishlist" });
  return { title: t("title") };
}

// תלוי ב-cookies()/Supabase לכל בקשה — אסור רינדור סטטי בזמן build.
export const dynamic = "force-dynamic";

/** /account/wishlist — ux-spec.md §A5: גריד ProductCard, un-heart אופטימי + undo. */
export default async function AccountWishlistPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "account.wishlist" });
  const tShop = await getTranslations({ locale, namespace: "shop" });

  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/account/wishlist");
  }

  const products = await getWishlistProducts(user.id, locale);

  return (
    <>
      <SectionHeading light eyebrow={t("title")} title={t("title")} />
      <div className="mt-10">
        <WishlistGrid initialProducts={products} outOfStockLabel={tShop("outOfStock")} />
      </div>
    </>
  );
}
