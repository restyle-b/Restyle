"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { db } from "@/lib/db";
import { courseSchema, type CourseInput } from "@/lib/admin/courses-schema";
import { COURSES_TAG } from "@/lib/content/get-courses";
import { routing } from "@/i18n/routing";

export type AdminActionResult = { ok: true } | { ok: false; error: string };

function toNullable(value: string | undefined) {
  return value && value.length > 0 ? value : null;
}

function revalidatePublicPaths() {
  revalidateTag(COURSES_TAG);
  for (const locale of routing.locales) {
    const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
    revalidatePath(prefix || "/");
    revalidatePath(`${prefix}/academy`);
  }
  revalidatePath("/admin/courses");
}

export async function getCourses() {
  await requireAdmin();
  return db.course.findMany({ orderBy: { order: "asc" } });
}

export async function updateCourses(input: unknown): Promise<AdminActionResult> {
  await requireAdmin();

  const parsed = courseSchema.array().max(100).safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }

  const rows: CourseInput[] = parsed.data;
  const slugs = rows.map((r) => r.slug);
  if (new Set(slugs).size !== slugs.length) {
    return { ok: false, error: "כל slug חייב להיות ייחודי" };
  }

  await db.$transaction(async (tx) => {
    await tx.course.deleteMany({ where: { slug: { notIn: slugs } } });
    for (const row of rows) {
      await tx.course.upsert({
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
          durationHe: row.durationHe,
          durationEn: toNullable(row.durationEn),
          durationAr: toNullable(row.durationAr),
          levelHe: row.levelHe,
          levelEn: toNullable(row.levelEn),
          levelAr: toNullable(row.levelAr),
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
          durationHe: row.durationHe,
          durationEn: toNullable(row.durationEn),
          durationAr: toNullable(row.durationAr),
          levelHe: row.levelHe,
          levelEn: toNullable(row.levelEn),
          levelAr: toNullable(row.levelAr),
          active: row.active,
        },
      });
    }
  });

  revalidatePublicPaths();
  return { ok: true };
}
