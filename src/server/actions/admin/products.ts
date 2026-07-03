"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/admin/activity-log";
import {
  productDetailsSchema,
  priceShekelsSchema,
  stockQuantitySchema,
  shekelsToAgorot,
} from "@/lib/admin/product-schema";
import { generateSlug } from "@/lib/admin/slug";
import { PRODUCTS_TAG } from "@/lib/content/get-products";
import { routing } from "@/i18n/routing";

export type AdminActionResult = { ok: true } | { ok: false; error: string };

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
  value: boolean,
): Promise<AdminActionResult> {
  const admin = await requireAdmin();

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
