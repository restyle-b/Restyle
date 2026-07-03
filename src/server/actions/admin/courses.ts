"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { db } from "@/lib/db";
import { courseSchema, courseShekelsToAgorot, type CourseInput } from "@/lib/admin/courses-schema";
import { generateSlug } from "@/lib/admin/slug";
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
  const submittedIds = rows.map((r) => r.id).filter((id): id is string => Boolean(id));
  if (new Set(submittedIds).size !== submittedIds.length) {
    return { ok: false, error: "מזהה כפול בקלט" };
  }

  // ה-slug נוצר בשרת ולעולם לא נערך ע"י האדמין. seed מכל ה-slugים הקיימים כדי
  // להבטיח ייחודיות, ומעדכנים אותו תוך כדי היצירה בבאטץ' הנוכחי.
  const existingSlugs = new Set(
    (await db.course.findMany({ select: { slug: true } })).map((c) => c.slug),
  );

  await db.$transaction(async (tx) => {
    await tx.course.deleteMany({ where: { id: { notIn: submittedIds } } });
    for (const row of rows) {
      const priceAgorot = courseShekelsToAgorot(row.priceShekels);
      const data = {
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
        priceAgorot,
        depositPercent: row.depositPercent,
        capacity: row.capacity ?? null,
        detailsHe: toNullable(row.detailsHe),
        detailsEn: toNullable(row.detailsEn),
        detailsAr: toNullable(row.detailsAr),
        syllabusHe: toNullable(row.syllabusHe),
        syllabusEn: toNullable(row.syllabusEn),
        syllabusAr: toNullable(row.syllabusAr),
      };
      if (row.id) {
        await tx.course.update({ where: { id: row.id }, data });
      } else {
        const slug = generateSlug(row.nameEn, existingSlugs);
        existingSlugs.add(slug);
        await tx.course.create({ data: { ...data, slug } });
      }
    }
  });

  revalidatePublicPaths();
  return { ok: true };
}
