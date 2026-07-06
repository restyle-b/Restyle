"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-admin";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/admin/activity-log";
import {
  productDetailsSchema,
  priceShekelsSchema,
  stockQuantitySchema,
  shekelsToAgorot,
  bulkIdsSchema,
  jerusalemLocalToUtc,
} from "@/lib/admin/product-schema";
import { generateSlug } from "@/lib/admin/slug";
import { PRODUCTS_TAG } from "@/lib/content/get-products";
import { routing } from "@/i18n/routing";

export type AdminActionResult = { ok: true } | { ok: false; error: string };
export type BulkActionResult = { ok: true; succeeded: number; failed: number } | { ok: false; error: string };

function toNullable(value: string | undefined) {
  return value && value.length > 0 ? value : null;
}

function formatShekels(agorot: number): string {
  return `${(agorot / 100).toFixed(2)}₪`;
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
  return db.product.findMany({
    // secondary key — "order" מתחיל ב-0 לכל מוצר חדש (quick-add), אז שוויון
    // הוא נפוץ; בלי tiebreaker Postgres לא מבטיח סדר יציב בין רענונים.
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    include: { category: { select: { nameHe: true } } },
  });
}

export async function getCategoriesForSelect() {
  await requireAdmin();
  return db.category.findMany({ orderBy: { order: "asc" }, select: { id: true, nameHe: true } });
}

async function categoryExists(categoryId: string | null): Promise<boolean> {
  if (!categoryId) return true;
  return (await db.category.count({ where: { id: categoryId } })) > 0;
}

/** יצירה — משמש גם ל"הוספה מהירה" וגם לטופס הפרטים המלא (Sheet), אותה סכימה. */
export async function createProduct(input: unknown): Promise<AdminActionResult> {
  const admin = await requireAdmin();

  const parsed = productDetailsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }

  const row = parsed.data;
  const categoryId = toNullable(row.categoryId);
  if (!(await categoryExists(categoryId))) {
    return { ok: false, error: "קטגוריה לא קיימת" };
  }

  const existingSlugs = new Set((await db.product.findMany({ select: { slug: true } })).map((p) => p.slug));
  const slug = generateSlug(row.nameEn, existingSlugs);

  const product = await db.product.create({
    data: {
      slug,
      order: row.order,
      nameHe: row.nameHe,
      nameEn: toNullable(row.nameEn),
      nameAr: toNullable(row.nameAr),
      descriptionHe: row.descriptionHe,
      descriptionEn: toNullable(row.descriptionEn),
      descriptionAr: toNullable(row.descriptionAr),
      priceAgorot: shekelsToAgorot(row.priceShekels),
      stock: row.stock,
      imageUrl: toNullable(row.imageUrl),
      categoryId,
      active: row.active,
      publishAt: jerusalemLocalToUtc(row.publishAt),
      seoTitleHe: toNullable(row.seoTitleHe),
      seoTitleEn: toNullable(row.seoTitleEn),
      seoTitleAr: toNullable(row.seoTitleAr),
      seoDescriptionHe: toNullable(row.seoDescriptionHe),
      seoDescriptionEn: toNullable(row.seoDescriptionEn),
      seoDescriptionAr: toNullable(row.seoDescriptionAr),
    },
  });

  await logActivity({
    actorEmail: admin.email,
    action: "product.create",
    entityType: "product",
    entityId: product.id,
    summary: `מוצר חדש נוצר: ${product.nameHe}`,
  });

  revalidatePublicPaths();
  return { ok: true };
}

/** עריכת פרטים מלאה (Sheet) — שם/תיאור רב-לשוני, קטגוריה, תמונה, מחיר, מלאי, נראות. */
export async function updateProductDetails(id: string, input: unknown): Promise<AdminActionResult> {
  const admin = await requireAdmin();

  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "מוצר לא נמצא" };

  const parsed = productDetailsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }

  const row = parsed.data;
  const categoryId = toNullable(row.categoryId);
  if (!(await categoryExists(categoryId))) {
    return { ok: false, error: "קטגוריה לא קיימת" };
  }

  await db.product.update({
    where: { id },
    data: {
      order: row.order,
      nameHe: row.nameHe,
      nameEn: toNullable(row.nameEn),
      nameAr: toNullable(row.nameAr),
      descriptionHe: row.descriptionHe,
      descriptionEn: toNullable(row.descriptionEn),
      descriptionAr: toNullable(row.descriptionAr),
      priceAgorot: shekelsToAgorot(row.priceShekels),
      stock: row.stock,
      imageUrl: toNullable(row.imageUrl),
      categoryId,
      active: row.active,
      publishAt: jerusalemLocalToUtc(row.publishAt),
      seoTitleHe: toNullable(row.seoTitleHe),
      seoTitleEn: toNullable(row.seoTitleEn),
      seoTitleAr: toNullable(row.seoTitleAr),
      seoDescriptionHe: toNullable(row.seoDescriptionHe),
      seoDescriptionEn: toNullable(row.seoDescriptionEn),
      seoDescriptionAr: toNullable(row.seoDescriptionAr),
    },
  });

  await logActivity({
    actorEmail: admin.email,
    action: "product.update",
    entityType: "product",
    entityId: id,
    summary: `פרטי מוצר עודכנו: ${row.nameHe}`,
  });

  revalidatePublicPaths();
  return { ok: true };
}

export async function deleteProduct(id: string): Promise<AdminActionResult> {
  const admin = await requireAdmin();

  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "מוצר לא נמצא" };

  await db.product.delete({ where: { id } });

  await logActivity({
    actorEmail: admin.email,
    action: "product.delete",
    entityType: "product",
    entityId: id,
    summary: `מוצר נמחק: ${existing.nameHe}`,
  });

  revalidatePublicPaths();
  return { ok: true };
}

/** עדכון מחיר inline — קלט בשקלים (כמו שאר האדמין), מומר לאגורות בשרת. */
export async function updateProductPrice(id: string, priceShekels: string): Promise<AdminActionResult> {
  const admin = await requireAdmin();

  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "מוצר לא נמצא" };

  const parsed = priceShekelsSchema.safeParse(priceShekels);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "מחיר לא תקין" };
  }

  const priceAgorot = shekelsToAgorot(parsed.data);
  await db.product.update({ where: { id }, data: { priceAgorot } });

  await logActivity({
    actorEmail: admin.email,
    action: "product.update",
    entityType: "product",
    entityId: id,
    summary: `מחיר "${existing.nameHe}" עודכן: ${formatShekels(existing.priceAgorot)} → ${formatShekels(priceAgorot)}`,
  });

  revalidatePublicPaths();
  return { ok: true };
}

/** מחיר מבצע inline — null מבטל את המבצע. חייב להיות נמוך מהמחיר הרגיל. */
export async function updateProductSalePrice(
  id: string,
  salePriceShekels: string | null,
): Promise<AdminActionResult> {
  const admin = await requireAdmin();

  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "מוצר לא נמצא" };

  let salePriceAgorot: number | null = null;
  if (salePriceShekels !== null) {
    const parsed = priceShekelsSchema.safeParse(salePriceShekels);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "מחיר לא תקין" };
    }
    salePriceAgorot = shekelsToAgorot(parsed.data);
    if (salePriceAgorot >= existing.priceAgorot) {
      return { ok: false, error: "מחיר המבצע חייב להיות נמוך מהמחיר הרגיל" };
    }
  }

  await db.product.update({ where: { id }, data: { salePriceAgorot } });

  await logActivity({
    actorEmail: admin.email,
    action: "product.update",
    entityType: "product",
    entityId: id,
    summary:
      salePriceAgorot === null
        ? `מחיר המבצע של "${existing.nameHe}" בוטל`
        : `מחיר מבצע ל"${existing.nameHe}" הוגדר: ${formatShekels(salePriceAgorot)}`,
  });

  revalidatePublicPaths();
  return { ok: true };
}

/** עדכון מלאי inline — action ייעודי (לא "product.update" כללי) כדי שהיסטוריית הפעילות תבליט שינויי מלאי. */
export async function updateProductStock(id: string, stock: number): Promise<AdminActionResult> {
  const admin = await requireAdmin();

  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "מוצר לא נמצא" };

  const parsed = stockQuantitySchema.safeParse(stock);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "כמות לא תקינה" };
  }

  await db.product.update({ where: { id }, data: { stock: parsed.data } });

  await logActivity({
    actorEmail: admin.email,
    action: "product.stock_change",
    entityType: "product",
    entityId: id,
    summary: `מלאי "${existing.nameHe}" עודכן: ${existing.stock} → ${parsed.data}`,
  });

  revalidatePublicPaths();
  return { ok: true };
}

async function toggleProductFlag(
  field: "active" | "available" | "featured",
  label: string,
  id: string,
  valueInput: boolean,
): Promise<AdminActionResult> {
  const admin = await requireAdmin();

  // TypeScript מבטיח boolean רק בזמן קומפילציה — קריאה ישירה ל-server action
  // יכולה לשלוח כל JSON; ולידציה מפורשת כאן, לא רק הסתמכות על Prisma לדחות בשקט.
  const parsedValue = z.boolean().safeParse(valueInput);
  if (!parsedValue.success) {
    return { ok: false, error: "ערך לא תקין" };
  }
  const value = parsedValue.data;

  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "מוצר לא נמצא" };

  switch (field) {
    case "active":
      await db.product.update({ where: { id }, data: { active: value } });
      break;
    case "available":
      await db.product.update({ where: { id }, data: { available: value } });
      break;
    case "featured":
      await db.product.update({ where: { id }, data: { featured: value } });
      break;
  }

  await logActivity({
    actorEmail: admin.email,
    action: "product.update",
    entityType: "product",
    entityId: id,
    summary: `${label} של "${existing.nameHe}" ${value ? "הופעלה" : "כובתה"}`,
  });

  revalidatePublicPaths();
  return { ok: true };
}

export async function toggleProductActive(id: string, value: boolean) {
  return toggleProductFlag("active", "נראות בחנות", id, value);
}
export async function toggleProductAvailable(id: string, value: boolean) {
  return toggleProductFlag("available", "זמינות לרכישה", id, value);
}
export async function toggleProductFeatured(id: string, value: boolean) {
  return toggleProductFlag("featured", "הבלטה", id, value);
}

/**
 * פעולת bulk גנרית — updateMany יחיד (לא לולאה של N פעולות בודדות),
 * succeeded/failed נגזרים מ-count מול אורך ids (לא מניחים הצלחה מלאה).
 */
async function bulkSetProductFlag(
  field: "active" | "featured",
  label: string,
  idsInput: string[],
  valueInput: boolean,
): Promise<BulkActionResult> {
  const admin = await requireAdmin();

  const parsedIds = bulkIdsSchema.safeParse(idsInput);
  if (!parsedIds.success) return { ok: false, error: "רשימת מוצרים לא תקינה" };
  const parsedValue = z.boolean().safeParse(valueInput);
  if (!parsedValue.success) return { ok: false, error: "ערך לא תקין" };

  const ids = parsedIds.data;
  const value = parsedValue.data;

  const where = { id: { in: ids } };
  const result =
    field === "active"
      ? await db.product.updateMany({ where, data: { active: value } })
      : await db.product.updateMany({ where, data: { featured: value } });

  const succeeded = result.count;
  const failed = ids.length - succeeded;

  await logActivity({
    actorEmail: admin.email,
    action: field === "active" ? "product.bulk_active" : "product.bulk_featured",
    entityType: "product",
    entityId: null,
    summary: `${label} ${value ? "הופעלה" : "כובתה"} עבור ${succeeded} מוצרים${failed > 0 ? ` (${failed} נכשלו)` : ""}`,
    metadata: { ids, value, succeeded, failed },
  });

  revalidatePublicPaths();
  return { ok: true, succeeded, failed };
}

export async function bulkSetProductActive(ids: string[], value: boolean) {
  return bulkSetProductFlag("active", "נראות בחנות", ids, value);
}
export async function bulkSetProductFeatured(ids: string[], value: boolean) {
  return bulkSetProductFlag("featured", "הבלטה", ids, value);
}

/** מחיקת bulk — deleteMany יחיד; onDelete:SetNull ב-OrderItem.productId מבטיח שאין אובדן נתוני הזמנות קיימות. */
export async function bulkDeleteProducts(idsInput: string[]): Promise<BulkActionResult> {
  const admin = await requireAdmin();

  const parsedIds = bulkIdsSchema.safeParse(idsInput);
  if (!parsedIds.success) return { ok: false, error: "רשימת מוצרים לא תקינה" };
  const ids = parsedIds.data;

  const result = await db.product.deleteMany({ where: { id: { in: ids } } });
  const succeeded = result.count;
  const failed = ids.length - succeeded;

  await logActivity({
    actorEmail: admin.email,
    action: "product.bulk_delete",
    entityType: "product",
    entityId: null,
    summary: `${succeeded} מוצרים נמחקו לצמיתות${failed > 0 ? ` (${failed} נכשלו)` : ""}`,
    metadata: { ids, succeeded, failed },
  });

  revalidatePublicPaths();
  return { ok: true, succeeded, failed };
}

/**
 * שכפול מוצר — מעתיק את כל השדות (שם/תיאור/מחיר/קטגוריה/תמונה/סדר/SEO) אך
 * מאפס לטיוטה: שם+"(עותק)", slug חדש, active=false, publishAt=null,
 * featured=false, stock=0, salePriceAgorot=null. available נשאר כפי שהיה.
 */
export async function duplicateProduct(id: string): Promise<AdminActionResult> {
  const admin = await requireAdmin();

  const source = await db.product.findUnique({ where: { id } });
  if (!source) return { ok: false, error: "מוצר לא נמצא" };

  const existingSlugs = new Set((await db.product.findMany({ select: { slug: true } })).map((p) => p.slug));
  const slug = generateSlug(source.nameEn, existingSlugs);
  const nameHe = `${source.nameHe} (עותק)`;

  const duplicate = await db.product.create({
    data: {
      slug,
      order: source.order,
      nameHe,
      nameEn: source.nameEn,
      nameAr: source.nameAr,
      descriptionHe: source.descriptionHe,
      descriptionEn: source.descriptionEn,
      descriptionAr: source.descriptionAr,
      priceAgorot: source.priceAgorot,
      salePriceAgorot: null,
      stock: 0,
      imageUrl: source.imageUrl,
      categoryId: source.categoryId,
      active: false,
      available: source.available,
      featured: false,
      publishAt: null,
      seoTitleHe: source.seoTitleHe,
      seoTitleEn: source.seoTitleEn,
      seoTitleAr: source.seoTitleAr,
      seoDescriptionHe: source.seoDescriptionHe,
      seoDescriptionEn: source.seoDescriptionEn,
      seoDescriptionAr: source.seoDescriptionAr,
    },
  });

  await logActivity({
    actorEmail: admin.email,
    action: "product.duplicate",
    entityType: "product",
    entityId: duplicate.id,
    summary: `מוצר שוכפל: "${source.nameHe}" → "${duplicate.nameHe}"`,
  });

  revalidatePublicPaths();
  return { ok: true };
}
