"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { db } from "@/lib/db";
import { productSchema, shekelsToAgorot, type ProductInput } from "@/lib/admin/product-schema";
import { PRODUCTS_TAG } from "@/lib/content/get-products";
import { routing } from "@/i18n/routing";

export type AdminActionResult = { ok: true } | { ok: false; error: string };

function toNullable(value: string | undefined) {
  return value && value.length > 0 ? value : null;
}

function revalidatePublicPaths() {
  revalidateTag(PRODUCTS_TAG);
  for (const locale of routing.locales) {
    const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
    revalidatePath(`${prefix}/shop`);
    revalidatePath(`${prefix}/shop/[slug]`, "page");
  }
  revalidatePath("/admin/products");
}

export async function getProducts() {
  await requireAdmin();
  return db.product.findMany({ orderBy: { order: "asc" } });
}

export async function getCategoriesForSelect() {
  await requireAdmin();
  return db.category.findMany({ orderBy: { order: "asc" }, select: { id: true, nameHe: true, slug: true } });
}

export async function updateProducts(input: unknown): Promise<AdminActionResult> {
  await requireAdmin();

  const parsed = productSchema.array().max(200).safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }

  const rows: ProductInput[] = parsed.data;
  const slugs = rows.map((r) => r.slug);
  if (new Set(slugs).size !== slugs.length) {
    return { ok: false, error: "כל slug חייב להיות ייחודי" };
  }

  // ולידציית categoryId מול קטגוריות קיימות בפועל — בלי זה, ID שגוי/לא-קיים
  // (שינוי בו-זמני של קטגוריות, או קריאה ישירה ל-server action שעוקפת את
  // ה-<select>) היה נתפס רק ע"י ה-foreign key ב-DB וזורק שגיאה לא-מטופלת.
  const categoryIds = new Set((await db.category.findMany({ select: { id: true } })).map((c) => c.id));
  for (const row of rows) {
    if (row.categoryId && !categoryIds.has(row.categoryId)) {
      return { ok: false, error: `קטגוריה לא קיימת עבור "${row.nameHe}"` };
    }
  }

  await db.$transaction(async (tx) => {
    await tx.product.deleteMany({ where: { slug: { notIn: slugs } } });
    for (const row of rows) {
      const priceAgorot = shekelsToAgorot(row.priceShekels);
      await tx.product.upsert({
        where: { slug: row.slug },
        create: {
          slug: row.slug,
          order: row.order,
          nameHe: row.nameHe,
          nameEn: toNullable(row.nameEn),
          nameAr: toNullable(row.nameAr),
          descriptionHe: row.descriptionHe,
          descriptionEn: toNullable(row.descriptionEn),
          descriptionAr: toNullable(row.descriptionAr),
          priceAgorot,
          stock: row.stock,
          imageUrl: toNullable(row.imageUrl),
          categoryId: toNullable(row.categoryId),
          active: row.active,
        },
        update: {
          order: row.order,
          nameHe: row.nameHe,
          nameEn: toNullable(row.nameEn),
          nameAr: toNullable(row.nameAr),
          descriptionHe: row.descriptionHe,
          descriptionEn: toNullable(row.descriptionEn),
          descriptionAr: toNullable(row.descriptionAr),
          priceAgorot,
          stock: row.stock,
          imageUrl: toNullable(row.imageUrl),
          categoryId: toNullable(row.categoryId),
          active: row.active,
        },
      });
    }
  });

  revalidatePublicPaths();
  return { ok: true };
}
