import { db } from "@/lib/db";
import { getEffectivePriceAgorot } from "@/lib/shop/pricing";
import type { ProductItem } from "@/lib/content/get-products";

function pick(locale: string, he: string, en: string | null, ar: string | null) {
  if (locale === "en" && en) return en;
  if (locale === "ar" && ar) return ar;
  return he;
}

/** מזהי המוצרים במועדפים של המשתמש — לבדיקת wishlisted עבור ProductCard בעמודי קטלוג. */
export async function getWishlistProductIds(userId: string): Promise<Set<string>> {
  const rows = await db.wishlistItem.findMany({ where: { userId }, select: { productId: true } });
  return new Set(rows.map((r) => r.productId));
}

/**
 * מוצרי המועדפים של המשתמש, ממופים לאותה צורה כמו getProducts() (ProductItem)
 * כדי לאפשר שימוש חוזר ב-ProductCard בלי type חדש. מוצרים שהופכו ללא-פעילים
 * (active=false) מוסתרים — Wishlist מצביע למוצר קיים, לא snapshot כמו הזמנה.
 */
export async function getWishlistProducts(userId: string, locale: string, limit?: number): Promise<ProductItem[]> {
  const rows = await db.wishlistItem.findMany({
    where: { userId, product: { active: true } },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { product: { include: { category: { select: { slug: true } } } } },
  });

  return rows.map((row) => {
    const p = row.product;
    const effectivePriceAgorot = getEffectivePriceAgorot(p.priceAgorot, p.salePriceAgorot);
    return {
      id: p.id,
      slug: p.slug,
      name: pick(locale, p.nameHe, p.nameEn, p.nameAr),
      description: pick(locale, p.descriptionHe, p.descriptionEn, p.descriptionAr),
      priceAgorot: p.priceAgorot,
      effectivePriceAgorot,
      onSale: effectivePriceAgorot < p.priceAgorot,
      stock: p.stock,
      available: p.available,
      featured: p.featured,
      imageUrl: p.imageUrl,
      categorySlug: p.category?.slug ?? null,
      publishAt: p.publishAt,
      seoTitleHe: p.seoTitleHe,
      seoTitleEn: p.seoTitleEn,
      seoTitleAr: p.seoTitleAr,
      seoDescriptionHe: p.seoDescriptionHe,
      seoDescriptionEn: p.seoDescriptionEn,
      seoDescriptionAr: p.seoDescriptionAr,
    };
  });
}
