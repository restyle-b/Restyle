"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { db } from "@/lib/db";
import { categorySchema, type CategoryInput } from "@/lib/admin/category-schema";
import { generateSlug } from "@/lib/admin/slug";
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
  const submittedIds = rows.map((r) => r.id).filter((id): id is string => Boolean(id));
  if (new Set(submittedIds).size !== submittedIds.length) {
    return { ok: false, error: "מזהה כפול בקלט" };
  }

  // ה-slug נוצר בשרת ולעולם לא נערך ע"י האדמין. seed מכל ה-slugים הקיימים כדי
  // להבטיח ייחודיות, ומעדכנים אותו תוך כדי היצירה בבאטץ' הנוכחי.
  const existingSlugs = new Set(
    (await db.category.findMany({ select: { slug: true } })).map((c) => c.slug),
  );

  await db.$transaction(async (tx) => {
    await tx.category.deleteMany({ where: { id: { notIn: submittedIds } } });
    for (const row of rows) {
      const data = {
        order: row.order,
        nameHe: row.nameHe,
        nameEn: toNullable(row.nameEn),
        nameAr: toNullable(row.nameAr),
        active: row.active,
      };
      if (row.id) {
        await tx.category.update({ where: { id: row.id }, data });
      } else {
        const slug = generateSlug(row.nameEn, existingSlugs);
        existingSlugs.add(slug);
        await tx.category.create({ data: { ...data, slug } });
      }
    }
  });

  revalidatePublicPaths();
  return { ok: true };
}
