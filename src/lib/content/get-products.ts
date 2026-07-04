import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { getEffectivePriceAgorot } from "@/lib/shop/pricing";

export const PRODUCTS_TAG = "products";

export type ProductItem = {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceAgorot: number;
  effectivePriceAgorot: number; // מבצע אם תקף, אחרת = priceAgorot
  onSale: boolean;
  stock: number;
  available: boolean;
  featured: boolean;
  imageUrl: string | null;
  categorySlug: string | null;
};

function pick(locale: string, he: string, en: string | null, ar: string | null) {
  if (locale === "en" && en) return en;
  if (locale === "ar" && ar) return ar;
  return he;
}

async function fetchProducts() {
  try {
    return await db.product.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      include: { category: { select: { slug: true } } },
    });
  } catch (err) {
    console.error("[content] failed to load products:", err);
    return [];
  }
}

// revalidate: הקטלוג נערך דרך האדמין (שמפעיל revalidateTag מיידית), אבל
// גם מתרענן לבד כל 5 דק' — כך ששינוי ישיר ב-DB (seed/מיגרציה) מופיע באתר
// בלי צורך ב-redeploy או פעולת אדמין.
const cachedFetchProducts = unstable_cache(fetchProducts, ["products-list"], {
  tags: [PRODUCTS_TAG],
  revalidate: 300,
});

/**
 * מוצרי החנות ל-locale הנתון. בניגוד ל-get-services.ts וכו' — אין fallback
 * לתוכן סטטי (Product הוא נתון טרנזקציוני-קטלוגי, לא תוכן שיווקי ערוך).
 * קטלוג ריק לפני שהמיגרציה+seed רצו הוא מצב תקין (מחזיר []).
 */
export async function getProducts(locale: string, categorySlug?: string): Promise<ProductItem[]> {
  const rows = await cachedFetchProducts();
  return rows
    .filter((r) => !categorySlug || r.category?.slug === categorySlug)
    .map((r) => {
      const effectivePriceAgorot = getEffectivePriceAgorot(r.priceAgorot, r.salePriceAgorot);
      return {
        id: r.id,
        slug: r.slug,
        name: pick(locale, r.nameHe, r.nameEn, r.nameAr),
        description: pick(locale, r.descriptionHe, r.descriptionEn, r.descriptionAr),
        priceAgorot: r.priceAgorot,
        effectivePriceAgorot,
        onSale: effectivePriceAgorot < r.priceAgorot,
        stock: r.stock,
        available: r.available,
        featured: r.featured,
        imageUrl: r.imageUrl,
        categorySlug: r.category?.slug ?? null,
      };
    });
}

export async function getProductBySlug(locale: string, slug: string): Promise<ProductItem | null> {
  const rows = await cachedFetchProducts();
  const row = rows.find((r) => r.slug === slug);
  if (!row) return null;
  const effectivePriceAgorot = getEffectivePriceAgorot(row.priceAgorot, row.salePriceAgorot);
  return {
    id: row.id,
    slug: row.slug,
    name: pick(locale, row.nameHe, row.nameEn, row.nameAr),
    description: pick(locale, row.descriptionHe, row.descriptionEn, row.descriptionAr),
    priceAgorot: row.priceAgorot,
    effectivePriceAgorot,
    onSale: effectivePriceAgorot < row.priceAgorot,
    stock: row.stock,
    available: row.available,
    featured: row.featured,
    imageUrl: row.imageUrl,
    categorySlug: row.category?.slug ?? null,
  };
}
