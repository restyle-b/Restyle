"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-admin";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/admin/activity-log";
import {
  promotionDetailsSchema,
  percentToBp,
  shekelsToAgorotOrNull,
} from "@/lib/admin/promotion-schema";
import { jerusalemLocalToUtc } from "@/lib/admin/product-schema";

export type AdminActionResult = { ok: true } | { ok: false; error: string };

function revalidatePromotionsPaths() {
  revalidatePath("/admin/promotions");
}

/** רשימת מבצעים לטבלת האדמין — כולל ספירת קופונים וזכאות (לתצוגת "כל העגלה" מול מוגבל). */
export async function getPromotions() {
  await requireAdmin();
  return db.promotion.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: {
      _count: { select: { coupons: true, eligibleProducts: true, eligibleCategories: true } },
    },
  });
}

/** רשימות בחירה לזכאות (מוצרים/קטגוריות) — לתיבות הסימון במקטע המתקדם ב-Sheet. */
export async function getEligibilityOptions() {
  await requireAdmin();
  const [products, categories] = await Promise.all([
    db.product.findMany({ orderBy: { nameHe: "asc" }, select: { id: true, nameHe: true } }),
    db.category.findMany({ orderBy: { order: "asc" }, select: { id: true, nameHe: true } }),
  ]);
  return { products, categories };
}

/**
 * מבצע בודד + זכאות מלאה (מזהי מוצרים/קטגוריות) + קופונים, לעריכה. קופונים
 * מוגבלים ל-200 האחרונים — bulk generation יכול לצבור אלפי קודים על מבצע
 * אחד (אין תקרה על כמות ה-runs), אותה תקרה בדיוק כמו getProductInventoryHistory.
 */
export async function getPromotion(id: string) {
  await requireAdmin();
  return db.promotion.findUnique({
    where: { id },
    include: {
      eligibleProducts: { select: { productId: true } },
      eligibleCategories: { select: { categoryId: true } },
      coupons: { orderBy: { createdAt: "desc" }, take: 200 },
    },
  });
}

/** בונה את שדות הכסף/אחוז לפי kind — שדות לא-רלוונטיים נשמרים null (defense-in-depth,
 * גם אם הטופס שלח ערך ישן). */
function buildKindFields(row: {
  kind: "PERCENT" | "FIXED_AMOUNT" | "FREE_SHIPPING";
  percentInput?: string;
  amountShekels?: string;
  freeShippingMinSubtotalShekels?: string;
}) {
  return {
    percentBp: row.kind === "PERCENT" ? percentToBp(row.percentInput!) : null,
    amountAgorot: row.kind === "FIXED_AMOUNT" ? shekelsToAgorotOrNull(row.amountShekels) : null,
    freeShippingMinSubtotalAgorot:
      row.kind === "FREE_SHIPPING" ? shekelsToAgorotOrNull(row.freeShippingMinSubtotalShekels) : null,
  };
}

async function validateEligibility(productIds: string[], categoryIds: string[]): Promise<string | null> {
  if (productIds.length > 0) {
    const count = await db.product.count({ where: { id: { in: productIds } } });
    if (count !== productIds.length) return "מוצר זכאי אחד או יותר לא נמצא";
  }
  if (categoryIds.length > 0) {
    const count = await db.category.count({ where: { id: { in: categoryIds } } });
    if (count !== categoryIds.length) return "קטגוריה זכאית אחת או יותר לא נמצאה";
  }
  return null;
}

export async function createPromotion(input: unknown): Promise<AdminActionResult> {
  const admin = await requireAdmin();

  const parsed = promotionDetailsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }
  const row = parsed.data;

  const eligibleProductIds = [...new Set(row.eligibleProductIds ?? [])];
  const eligibleCategoryIds = [...new Set(row.eligibleCategoryIds ?? [])];
  const eligibilityError = await validateEligibility(eligibleProductIds, eligibleCategoryIds);
  if (eligibilityError) return { ok: false, error: eligibilityError };

  const promotion = await db.promotion.create({
    data: {
      name: row.name,
      description: row.description || null,
      kind: row.kind,
      automatic: row.automatic,
      appliesTo: row.appliesTo,
      ...buildKindFields(row),
      minSubtotalAgorot: shekelsToAgorotOrNull(row.minSubtotalShekels) ?? 0,
      appliesToSaleItems: row.appliesToSaleItems,
      startsAt: jerusalemLocalToUtc(row.startsAt),
      endsAt: jerusalemLocalToUtc(row.endsAt),
      active: row.active,
      priority: row.priority ?? 0,
      stackable: row.stackable ?? false,
      eligibleProducts: { createMany: { data: eligibleProductIds.map((productId) => ({ productId })) } },
      eligibleCategories: { createMany: { data: eligibleCategoryIds.map((categoryId) => ({ categoryId })) } },
    },
  });

  await logActivity({
    actorEmail: admin.email,
    action: "promotion.create",
    entityType: "promotion",
    entityId: promotion.id,
    summary: `מבצע חדש נוצר: ${promotion.name}`,
  });

  revalidatePromotionsPaths();
  return { ok: true };
}

export async function updatePromotion(id: string, input: unknown): Promise<AdminActionResult> {
  const admin = await requireAdmin();

  const existing = await db.promotion.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "מבצע לא נמצא" };

  const parsed = promotionDetailsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }
  const row = parsed.data;

  const eligibleProductIds = [...new Set(row.eligibleProductIds ?? [])];
  const eligibleCategoryIds = [...new Set(row.eligibleCategoryIds ?? [])];
  const eligibilityError = await validateEligibility(eligibleProductIds, eligibleCategoryIds);
  if (eligibilityError) return { ok: false, error: eligibilityError };

  // עדכון הזכאות: מחיקה מלאה ויצירה מחדש בתוך אותה טרנזקציה — נקי יותר מ-diff
  // עבור עד 500 שורות (התקרה של eligibleIdsSchema), ותמיד עקבי מול מה שנשלח.
  await db.$transaction([
    db.promotion.update({
      where: { id },
      data: {
        name: row.name,
        description: row.description || null,
        kind: row.kind,
        automatic: row.automatic,
        appliesTo: row.appliesTo,
        ...buildKindFields(row),
        minSubtotalAgorot: shekelsToAgorotOrNull(row.minSubtotalShekels) ?? 0,
        appliesToSaleItems: row.appliesToSaleItems,
        startsAt: jerusalemLocalToUtc(row.startsAt),
        endsAt: jerusalemLocalToUtc(row.endsAt),
        active: row.active,
        priority: row.priority ?? 0,
        stackable: row.stackable ?? false,
      },
    }),
    db.promotionProduct.deleteMany({ where: { promotionId: id } }),
    db.promotionCategory.deleteMany({ where: { promotionId: id } }),
    ...(eligibleProductIds.length > 0
      ? [
          db.promotionProduct.createMany({
            data: eligibleProductIds.map((productId) => ({ promotionId: id, productId })),
          }),
        ]
      : []),
    ...(eligibleCategoryIds.length > 0
      ? [
          db.promotionCategory.createMany({
            data: eligibleCategoryIds.map((categoryId) => ({ promotionId: id, categoryId })),
          }),
        ]
      : []),
  ]);

  await logActivity({
    actorEmail: admin.email,
    action: "promotion.update",
    entityType: "promotion",
    entityId: id,
    summary: `מבצע עודכן: ${row.name}`,
  });

  revalidatePromotionsPaths();
  return { ok: true };
}

/** מחיקת מבצע — cascade ב-schema מוחק קופונים/מימושים/שורות זכאות משויכים. */
export async function deletePromotion(id: string): Promise<AdminActionResult> {
  const admin = await requireAdmin();

  const existing = await db.promotion.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "מבצע לא נמצא" };

  await db.promotion.delete({ where: { id } });

  await logActivity({
    actorEmail: admin.email,
    action: "promotion.delete",
    entityType: "promotion",
    entityId: id,
    summary: `מבצע נמחק: ${existing.name}`,
  });

  revalidatePromotionsPaths();
  return { ok: true };
}

export async function togglePromotionActive(id: string, valueInput: boolean): Promise<AdminActionResult> {
  const admin = await requireAdmin();

  const parsedValue = z.boolean().safeParse(valueInput);
  if (!parsedValue.success) return { ok: false, error: "ערך לא תקין" };
  const value = parsedValue.data;

  const existing = await db.promotion.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "מבצע לא נמצא" };

  await db.promotion.update({ where: { id }, data: { active: value } });

  await logActivity({
    actorEmail: admin.email,
    action: "promotion.update",
    entityType: "promotion",
    entityId: id,
    summary: `מבצע "${existing.name}" ${value ? "הופעל" : "כובה"}`,
  });

  revalidatePromotionsPaths();
  return { ok: true };
}

/**
 * מימושים אחרונים של מבצע — דרך הקופונים שלו בלבד (Stage A: מבצעים אוטומטיים
 * לא נספרים עדיין, ראה reconciliation §4 ב-platform-upgrade.md). מוגבל ל-50
 * האחרונים (תואם את הכותרת "מימושים אחרונים" בעמוד — לא רשימה מלאה/היסטורית).
 * מוחזר גם עבור מבצע ללא קופונים (רשימה ריקה) — לא שגיאה.
 */
export async function getPromotionRedemptions(promotionId: string) {
  await requireAdmin();

  const existing = await db.promotion.findUnique({ where: { id: promotionId }, select: { id: true } });
  if (!existing) return null;

  return db.couponRedemption.findMany({
    where: { coupon: { promotionId } },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      coupon: { select: { code: true } },
      order: { select: { orderNumber: true, customerName: true, customerEmail: true, totalAgorot: true } },
    },
  });
}
