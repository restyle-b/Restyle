import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";

export const CATEGORIES_TAG = "categories";

export type CategoryItem = { slug: string; name: string };

function pick(locale: string, he: string, en: string | null, ar: string | null) {
  if (locale === "en" && en) return en;
  if (locale === "ar" && ar) return ar;
  return he;
}

async function fetchCategories() {
  try {
    return await db.category.findMany({ where: { active: true }, orderBy: { order: "asc" } });
  } catch (err) {
    console.error("[content] failed to load categories:", err);
    return [];
  }
}

const cachedFetchCategories = unstable_cache(fetchCategories, ["categories-list"], {
  tags: [CATEGORIES_TAG],
  revalidate: 300,
});

export async function getCategories(locale: string): Promise<CategoryItem[]> {
  const rows = await cachedFetchCategories();
  return rows.map((r) => ({
    slug: r.slug,
    name: pick(locale, r.nameHe, r.nameEn, r.nameAr),
  }));
}
