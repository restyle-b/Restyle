"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-admin";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/admin/activity-log";
import { categoryDetailsSchema } from "@/lib/admin/category-schema";
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

/** כולל מספר מוצרים (כל המוצרים, לא רק פעילים — האדמין רוצה את המספר האמיתי). */
export async function getCategories() {
  await requireAdmin();
  return db.category.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    include: { _count: { select: { products: true } } },
  });
}

/** יצירת קטגוריה חדשה — slug נוצר בשרת מתוך nameEn, לעולם לא נערך ע"י האדמין. */
export async function createCategory(input: unknown): Promise<AdminActionResult> {
  const admin = await requireAdmin();

  const parsed = categoryDetailsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }
  const row = parsed.data;

  const existingSlugs = new Set(
    (await db.category.findMany({ select: { slug: true } })).map((c) => c.slug),
  );
  const slug = generateSlug(row.nameEn, existingSlugs);

  const category = await db.category.create({
    data: {
      slug,
      order: row.order,
      nameHe: row.nameHe,
      nameEn: toNullable(row.nameEn),
      nameAr: toNullable(row.nameAr),
      active: row.active,
    },
  });

  await logActivity({
    actorEmail: admin.email,
    action: "category.create",
    entityType: "category",
    entityId: category.id,
    summary: `קטגוריה חדשה נוצרה: ${category.nameHe}`,
  });

  revalidatePublicPaths();
  return { ok: true };
}

/** עדכון קטגוריה קיימת — לא נוגע ב-slug. */
export async function updateCategory(id: string, input: unknown): Promise<AdminActionResult> {
  const admin = await requireAdmin();

  const existing = await db.category.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "קטגוריה לא נמצאה" };

  const parsed = categoryDetailsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }
  const row = parsed.data;

  await db.category.update({
    where: { id },
    data: {
      order: row.order,
      nameHe: row.nameHe,
      nameEn: toNullable(row.nameEn),
      nameAr: toNullable(row.nameAr),
      active: row.active,
    },
  });

  await logActivity({
    actorEmail: admin.email,
    action: "category.update",
    entityType: "category",
    entityId: id,
    summary: `קטגוריה עודכנה: ${row.nameHe}`,
  });

  revalidatePublicPaths();
  return { ok: true };
}

/** מחיקת קטגוריה — Product.categoryId הוא onDelete:SetNull, אז מוצרים משויכים
 * נשארים קיימים וללא קטגוריה; אין צורך בניתוק ידני. */
export async function deleteCategory(id: string): Promise<AdminActionResult> {
  const admin = await requireAdmin();

  const existing = await db.category.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "קטגוריה לא נמצאה" };

  await db.category.delete({ where: { id } });

  await logActivity({
    actorEmail: admin.email,
    action: "category.delete",
    entityType: "category",
    entityId: id,
    summary: `קטגוריה נמחקה: ${existing.nameHe}`,
  });

  revalidatePublicPaths();
  return { ok: true };
}

/** שכפול — מתחיל כטיוטה (active=false) בכוונה, ברירת מחדל בטוחה. */
export async function duplicateCategory(id: string): Promise<AdminActionResult> {
  const admin = await requireAdmin();

  const existing = await db.category.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "קטגוריה לא נמצאה" };

  const existingSlugs = new Set(
    (await db.category.findMany({ select: { slug: true } })).map((c) => c.slug),
  );
  const slug = generateSlug(existing.nameEn, existingSlugs);
  const nameHe = `${existing.nameHe} (עותק)`;

  const copy = await db.category.create({
    data: {
      slug,
      order: existing.order,
      nameHe,
      nameEn: existing.nameEn,
      nameAr: existing.nameAr,
      active: false,
    },
  });

  await logActivity({
    actorEmail: admin.email,
    action: "category.create",
    entityType: "category",
    entityId: copy.id,
    summary: `קטגוריה שוכפלה מ-"${existing.nameHe}": ${nameHe}`,
  });

  revalidatePublicPaths();
  return { ok: true };
}

/** טוגל נראות inline — ולידציית zod מפורשת על value (defense in depth; קריאה
 * ישירה ל-server action יכולה לשלוח כל JSON, לא רק להסתמך על טיפוס ה-TS). */
export async function toggleCategoryActive(id: string, valueInput: boolean): Promise<AdminActionResult> {
  const admin = await requireAdmin();

  const parsedValue = z.boolean().safeParse(valueInput);
  if (!parsedValue.success) {
    return { ok: false, error: "ערך לא תקין" };
  }
  const value = parsedValue.data;

  const existing = await db.category.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "קטגוריה לא נמצאה" };

  await db.category.update({ where: { id }, data: { active: value } });

  await logActivity({
    actorEmail: admin.email,
    action: "category.update",
    entityType: "category",
    entityId: id,
    summary: `נראות "${existing.nameHe}" ${value ? "הופעלה" : "כובתה"}`,
  });

  revalidatePublicPaths();
  return { ok: true };
}

/** הזזת קטגוריה מעלה/מטה — מחליף את ערך order מול השכן בכיוון המבוקש, בתוך
 * טרנזקציה. לוגיקה עצמאית לזרם הזה בכוונה (לא helper משותף — ~12 שורות). */
export async function reorderCategory(
  id: string,
  direction: "up" | "down",
): Promise<AdminActionResult> {
  const admin = await requireAdmin();

  const parsedDirection = z.enum(["up", "down"]).safeParse(direction);
  if (!parsedDirection.success) {
    return { ok: false, error: "כיוון לא תקין" };
  }

  const all = await db.category.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: { id: true, order: true, nameHe: true },
  });
  const index = all.findIndex((c) => c.id === id);
  if (index === -1) return { ok: false, error: "קטגוריה לא נמצאה" };

  const neighborIndex = parsedDirection.data === "up" ? index - 1 : index + 1;
  if (neighborIndex < 0 || neighborIndex >= all.length) {
    return { ok: false, error: "אין לאן להזיז" };
  }

  const current = all[index];
  const neighbor = all[neighborIndex];
  if (!current || !neighbor) return { ok: false, error: "קטגוריה לא נמצאה" };

  await db.$transaction([
    db.category.update({ where: { id: current.id }, data: { order: neighbor.order } }),
    db.category.update({ where: { id: neighbor.id }, data: { order: current.order } }),
  ]);

  await logActivity({
    actorEmail: admin.email,
    action: "category.update",
    entityType: "category",
    entityId: id,
    summary: `סדר קטגוריה "${current.nameHe}" הוזז (${parsedDirection.data === "up" ? "מעלה" : "מטה"})`,
  });

  revalidatePublicPaths();
  return { ok: true };
}
