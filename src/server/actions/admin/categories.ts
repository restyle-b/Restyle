"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { db } from "@/lib/db";
import { categorySchema, type CategoryInput } from "@/lib/admin/category-schema";
import { CATEGORIES_TAG } from "@/lib/content/get-categories";
import { routing } from "@/i18n/routing";

export type AdminActionResult = { ok: true } | { ok: false; error: string };

function toNullable(value: string | undefined) {
  return value && value.length > 0 ? value : null;
}

function revalidatePublicPaths() {
  revalidateTag(CATEGORIES_TAG);
  for (const locale of routing.locales) {
    const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
    revalidatePath(`${prefix}/shop`);
  }
  revalidatePath("/admin/categories");
}

export async function getCategories() {
  await requireAdmin();
  return db.category.findMany({ orderBy: { order: "asc" } });
}

export async function updateCategories(input: unknown): Promise<AdminActionResult> {
  await requireAdmin();

  const parsed = categorySchema.array().max(100).safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }

  const rows: CategoryInput[] = parsed.data;
  const slugs = rows.map((r) => r.slug);
  if (new Set(slugs).size !== slugs.length) {
    return { ok: false, error: "כל slug חייב להיות ייחודי" };
  }

  await db.$transaction(async (tx) => {
    await tx.category.deleteMany({ where: { slug: { notIn: slugs } } });
    for (const row of rows) {
      await tx.category.upsert({
        where: { slug: row.slug },
        create: {
          slug: row.slug,
          order: row.order,
          nameHe: row.nameHe,
          nameEn: toNullable(row.nameEn),
          nameAr: toNullable(row.nameAr),
          active: row.active,
        },
        update: {
          order: row.order,
          nameHe: row.nameHe,
          nameEn: toNullable(row.nameEn),
          nameAr: toNullable(row.nameAr),
          active: row.active,
        },
      });
    }
  });

  revalidatePublicPaths();
  return { ok: true };
}
