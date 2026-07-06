"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-admin";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/admin/activity-log";
import { courseSchema, courseShekelsToAgorot, type CourseInput } from "@/lib/admin/courses-schema";
import { jerusalemDatetimeLocalToUtc } from "@/lib/admin/course-datetime";
import { generateSlug } from "@/lib/admin/slug";
import { COURSES_TAG } from "@/lib/content/get-courses";
import { routing } from "@/i18n/routing";

export type AdminActionResult = { ok: true } | { ok: false; error: string };

function toNullable(value: string | undefined) {
  return value && value.length > 0 ? value : null;
}

/** "" / undefined → null (לא מתוזמן); אחרת המרה משעון ישראל ל-UTC (ראה course-datetime.ts). */
function publishAtToUtc(value: string | undefined): Date | null {
  if (!value) return null;
  return jerusalemDatetimeLocalToUtc(value);
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

/** נתוני ניהול — כולל ספירת נרשמים (מקומות שנתפסו בפועל: מקדמה ששולמה/שולם
 * במלואו). אותה הגדרה בדיוק כמו get-courses.ts/create-enrollment.ts, לא
 * המצאה חדשה. */
export async function getCourses() {
  await requireAdmin();
  return db.course.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    include: {
      _count: { select: { enrollments: { where: { status: { in: ["DEPOSIT_PAID", "PAID"] } } } } },
    },
  });
}

function buildCourseData(row: CourseInput) {
  return {
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
    priceAgorot: courseShekelsToAgorot(row.priceShekels),
    depositPercent: row.depositPercent,
    capacity: row.capacity ?? null,
    detailsHe: toNullable(row.detailsHe),
    detailsEn: toNullable(row.detailsEn),
    detailsAr: toNullable(row.detailsAr),
    syllabusHe: toNullable(row.syllabusHe),
    syllabusEn: toNullable(row.syllabusEn),
    syllabusAr: toNullable(row.syllabusAr),
    publishAt: publishAtToUtc(row.publishAt),
    seoTitleHe: toNullable(row.seoTitleHe),
    seoTitleEn: toNullable(row.seoTitleEn),
    seoTitleAr: toNullable(row.seoTitleAr),
    seoDescriptionHe: toNullable(row.seoDescriptionHe),
    seoDescriptionEn: toNullable(row.seoDescriptionEn),
    seoDescriptionAr: toNullable(row.seoDescriptionAr),
  };
}

/** יצירת קורס חדש — Sheet (יצירה+עריכה). slug נוצר בשרת, לעולם לא נערך ע"י האדמין. */
export async function createCourse(input: unknown): Promise<AdminActionResult> {
  const admin = await requireAdmin();

  const parsed = courseSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }
  const row = parsed.data;

  const existingSlugs = new Set((await db.course.findMany({ select: { slug: true } })).map((c) => c.slug));
  const slug = generateSlug(row.nameEn, existingSlugs);

  // סדר תצוגה — לא נערך ידנית בטופס (מנוהל דרך כפתורי סדר בטבלה); קורס חדש
  // מתווסף בסוף הרשימה.
  const order =
    row.order ?? ((await db.course.aggregate({ _max: { order: true } }))._max.order ?? -1) + 1;

  const course = await db.course.create({ data: { ...buildCourseData(row), slug, order } });

  await logActivity({
    actorEmail: admin.email,
    action: "course.create",
    entityType: "course",
    entityId: course.id,
    summary: `קורס חדש נוצר: ${course.nameHe}`,
  });

  revalidatePublicPaths();
  return { ok: true };
}

/** עריכת קורס קיים — Sheet. */
export async function updateCourse(id: string, input: unknown): Promise<AdminActionResult> {
  const admin = await requireAdmin();

  const existing = await db.course.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "קורס לא נמצא" };

  const parsed = courseSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }
  const row = parsed.data;

  await db.course.update({
    where: { id },
    data: { ...buildCourseData(row), order: row.order ?? existing.order },
  });

  await logActivity({
    actorEmail: admin.email,
    action: "course.update",
    entityType: "course",
    entityId: id,
    summary: `פרטי קורס עודכנו: ${row.nameHe}`,
  });

  revalidatePublicPaths();
  return { ok: true };
}

/**
 * מחיקת קורס. Enrollment.courseId הוא onDelete: SetNull (ראה schema.prisma) —
 * הרשמות קיימות נשארות (courseNameHeSnapshot כבר שומר את השם), courseId רק
 * מתאפס ל-null. בטוח למחוק גם קורס עם הרשמות, בלי guard נוסף.
 */
export async function deleteCourse(id: string): Promise<AdminActionResult> {
  const admin = await requireAdmin();

  const existing = await db.course.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "קורס לא נמצא" };

  await db.course.delete({ where: { id } });

  await logActivity({
    actorEmail: admin.email,
    action: "course.delete",
    entityType: "course",
    entityId: id,
    summary: `קורס נמחק: ${existing.nameHe}`,
  });

  revalidatePublicPaths();
  return { ok: true };
}

/** שכפול קורס — עותק תמיד טיוטה (active=false, publishAt=null), slug חדש. */
export async function duplicateCourse(id: string): Promise<AdminActionResult> {
  const admin = await requireAdmin();

  const existing = await db.course.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "קורס לא נמצא" };

  const existingSlugs = new Set((await db.course.findMany({ select: { slug: true } })).map((c) => c.slug));
  const slug = generateSlug(existing.nameEn, existingSlugs);
  const maxOrder = (await db.course.aggregate({ _max: { order: true } }))._max.order ?? -1;

  const duplicate = await db.course.create({
    data: {
      slug,
      order: maxOrder + 1,
      nameHe: `${existing.nameHe} (עותק)`,
      nameEn: existing.nameEn,
      nameAr: existing.nameAr,
      descriptionHe: existing.descriptionHe,
      descriptionEn: existing.descriptionEn,
      descriptionAr: existing.descriptionAr,
      durationHe: existing.durationHe,
      durationEn: existing.durationEn,
      durationAr: existing.durationAr,
      levelHe: existing.levelHe,
      levelEn: existing.levelEn,
      levelAr: existing.levelAr,
      priceAgorot: existing.priceAgorot,
      depositPercent: existing.depositPercent,
      capacity: existing.capacity,
      detailsHe: existing.detailsHe,
      detailsEn: existing.detailsEn,
      detailsAr: existing.detailsAr,
      syllabusHe: existing.syllabusHe,
      syllabusEn: existing.syllabusEn,
      syllabusAr: existing.syllabusAr,
      // תמיד טיוטה בטוחה — לא "יורש" נראות/תזמון מהמקור.
      active: false,
      publishAt: null,
      seoTitleHe: existing.seoTitleHe,
      seoTitleEn: existing.seoTitleEn,
      seoTitleAr: existing.seoTitleAr,
      seoDescriptionHe: existing.seoDescriptionHe,
      seoDescriptionEn: existing.seoDescriptionEn,
      seoDescriptionAr: existing.seoDescriptionAr,
    },
  });

  await logActivity({
    actorEmail: admin.email,
    action: "course.create",
    entityType: "course",
    entityId: duplicate.id,
    summary: `קורס שוכפל: ${duplicate.nameHe} (מקור: ${existing.nameHe})`,
  });

  revalidatePublicPaths();
  return { ok: true };
}

export async function toggleCourseActive(id: string, valueInput: boolean): Promise<AdminActionResult> {
  const admin = await requireAdmin();

  // TypeScript מבטיח boolean רק בזמן קומפילציה — הגנת-עומק מפני קריאה ישירה
  // ל-server action עם JSON שרירותי (אותו דפוס בדיוק כמו products.ts).
  const parsedValue = z.boolean().safeParse(valueInput);
  if (!parsedValue.success) {
    return { ok: false, error: "ערך לא תקין" };
  }
  const value = parsedValue.data;

  const existing = await db.course.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "קורס לא נמצא" };

  await db.course.update({ where: { id }, data: { active: value } });

  await logActivity({
    actorEmail: admin.email,
    action: "course.update",
    entityType: "course",
    entityId: id,
    summary: `נראות קורס "${existing.nameHe}" ${value ? "הופעלה" : "כובתה"}`,
  });

  revalidatePublicPaths();
  return { ok: true };
}

/** החלפת סדר עם השכן (למעלה/למטה) — מבוססת אינדקס ברשימה ממוינת יציבה
 * (order, createdAt), לא על השוואת ערכי order גולמיים, כדי לא להישבר על
 * ערכי order כפולים ישנים. עצמאי מקטגוריות/מוצרים בכוונה (ראה m3-catalog-plan.md §5). */
export async function reorderCourse(id: string, direction: "up" | "down"): Promise<AdminActionResult> {
  const admin = await requireAdmin();

  const all = await db.course.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] });
  const index = all.findIndex((c) => c.id === id);
  if (index === -1) return { ok: false, error: "קורס לא נמצא" };

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= all.length) {
    return { ok: true }; // כבר בקצה הרשימה — לא שגיאה, פשוט no-op
  }

  const current = all[index];
  const neighbor = all[swapIndex];
  if (!current || !neighbor) return { ok: false, error: "קורס לא נמצא" };

  await db.$transaction([
    db.course.update({ where: { id: current.id }, data: { order: neighbor.order } }),
    db.course.update({ where: { id: neighbor.id }, data: { order: current.order } }),
  ]);

  await logActivity({
    actorEmail: admin.email,
    action: "course.update",
    entityType: "course",
    entityId: current.id,
    summary: `סדר קורס "${current.nameHe}" הוזז ${direction === "up" ? "למעלה" : "למטה"}`,
  });

  revalidatePublicPaths();
  return { ok: true };
}
