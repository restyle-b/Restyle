"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth/require-admin";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/admin/activity-log";
import {
  couponDetailsSchema,
  generateCouponsSchema,
  shekelsToAgorotOrNull,
  intInputToNullable,
} from "@/lib/admin/promotion-schema";
import { jerusalemLocalToUtc } from "@/lib/admin/product-schema";

export type AdminActionResult = { ok: true } | { ok: false; error: string };
export type GenerateCouponsResult = { ok: true; codes: string[] } | { ok: false; error: string };

function revalidatePromotionsPaths() {
  revalidatePath("/admin/promotions");
}

/** קידומת P2002 (unique constraint) של Prisma — משמש להבחין בין קונפליקט קוד לשגיאה אחרת. */
function isUniqueConstraintError(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}

async function promotionExists(promotionId: string): Promise<boolean> {
  return (await db.promotion.count({ where: { id: promotionId } })) > 0;
}

export async function createCoupon(promotionId: string, input: unknown): Promise<AdminActionResult> {
  const admin = await requireAdmin();

  if (!(await promotionExists(promotionId))) return { ok: false, error: "מבצע לא נמצא" };

  const parsed = couponDetailsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }
  const row = parsed.data;
  const code = row.code.toUpperCase();

  try {
    const coupon = await db.coupon.create({
      data: {
        code,
        promotionId,
        usageLimit: intInputToNullable(row.usageLimitInput),
        perCustomerLimit: intInputToNullable(row.perCustomerLimitInput),
        minSubtotalAgorot: shekelsToAgorotOrNull(row.minSubtotalShekels),
        startsAt: jerusalemLocalToUtc(row.startsAt),
        expiresAt: jerusalemLocalToUtc(row.expiresAt),
        active: row.active,
      },
    });

    await logActivity({
      actorEmail: admin.email,
      action: "coupon.create",
      entityType: "coupon",
      entityId: coupon.id,
      summary: `קופון חדש נוצר: ${coupon.code}`,
    });
  } catch (err) {
    if (isUniqueConstraintError(err)) return { ok: false, error: "קוד זה כבר קיים במערכת" };
    throw err;
  }

  revalidatePromotionsPaths();
  return { ok: true };
}

export async function updateCoupon(id: string, input: unknown): Promise<AdminActionResult> {
  const admin = await requireAdmin();

  const existing = await db.coupon.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "קופון לא נמצא" };

  const parsed = couponDetailsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }
  const row = parsed.data;
  const code = row.code.toUpperCase();

  try {
    await db.coupon.update({
      where: { id },
      data: {
        code,
        usageLimit: intInputToNullable(row.usageLimitInput),
        perCustomerLimit: intInputToNullable(row.perCustomerLimitInput),
        minSubtotalAgorot: shekelsToAgorotOrNull(row.minSubtotalShekels),
        startsAt: jerusalemLocalToUtc(row.startsAt),
        expiresAt: jerusalemLocalToUtc(row.expiresAt),
        active: row.active,
      },
    });

    await logActivity({
      actorEmail: admin.email,
      action: "coupon.update",
      entityType: "coupon",
      entityId: id,
      summary: `קופון עודכן: ${code}`,
    });
  } catch (err) {
    if (isUniqueConstraintError(err)) return { ok: false, error: "קוד זה כבר קיים במערכת" };
    throw err;
  }

  revalidatePromotionsPaths();
  return { ok: true };
}

/** מחיקת קופון — cascade מוחק מימושים משויכים (CouponRedemption.onDelete: Cascade). */
export async function deleteCoupon(id: string): Promise<AdminActionResult> {
  const admin = await requireAdmin();

  const existing = await db.coupon.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "קופון לא נמצא" };

  await db.coupon.delete({ where: { id } });

  await logActivity({
    actorEmail: admin.email,
    action: "coupon.delete",
    entityType: "coupon",
    entityId: id,
    summary: `קופון נמחק: ${existing.code}`,
  });

  revalidatePromotionsPaths();
  return { ok: true };
}

export async function toggleCouponActive(id: string, valueInput: boolean): Promise<AdminActionResult> {
  const admin = await requireAdmin();

  const parsedValue = z.boolean().safeParse(valueInput);
  if (!parsedValue.success) return { ok: false, error: "ערך לא תקין" };
  const value = parsedValue.data;

  const existing = await db.coupon.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "קופון לא נמצא" };

  await db.coupon.update({ where: { id }, data: { active: value } });

  await logActivity({
    actorEmail: admin.email,
    action: "coupon.update",
    entityType: "coupon",
    entityId: id,
    summary: `קופון "${existing.code}" ${value ? "הופעל" : "כובה"}`,
  });

  revalidatePromotionsPaths();
  return { ok: true };
}

// אלפבית ל-קוד אקראי: אותיות גדולות + ספרות, בלי 0/O/1/I/L (עמימות בקריאה/הדפסה).
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/** קוד אקראי קריפטוגרפי (crypto.randomBytes, לא Math.random) — modulo bias
 * זניח לחלוטין כאן (32-letter alphabet, שימוש בקידוד לא-אבטחתי). */
function randomCode(length: number): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += CODE_ALPHABET[bytes[i]! % CODE_ALPHABET.length];
  }
  return out;
}

const DEFAULT_CODE_LENGTH = 8;
const MAX_GENERATION_ROUNDS = 10;

/**
 * יצירת N קודי קופון ייחודיים במבצע אחד. אקראיות קריפטוגרפית + retry-on-collision:
 * מייצרים מועמדים, מסננים כפילויות בתוך האצווה עצמה, ואז בודקים מול ה-DB
 * (unique constraint על Coupon.code) ומחליפים כל קוד שכבר קיים. כמה סבבים
 * (עד MAX_GENERATION_ROUNDS) כדי לכסות התנגשויות נדירות; createMany בסוף עם
 * skipDuplicates כרשת ביטחון אחרונה מול race עם בקשה מקבילה.
 */
export async function generateCoupons(promotionId: string, input: unknown): Promise<GenerateCouponsResult> {
  const admin = await requireAdmin();

  if (!(await promotionExists(promotionId))) return { ok: false, error: "מבצע לא נמצא" };

  const parsed = generateCouponsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }
  const row = parsed.data;
  const codeLength = row.codeLength ?? DEFAULT_CODE_LENGTH;
  const prefix = row.prefix ? `${row.prefix.toUpperCase()}-` : "";

  const codes = new Set<string>();
  let round = 0;
  while (codes.size < row.count && round < MAX_GENERATION_ROUNDS) {
    round++;
    const needed = row.count - codes.size;
    const candidates: string[] = [];
    for (let i = 0; i < needed; i++) {
      candidates.push(`${prefix}${randomCode(codeLength)}`);
    }
    const uniqueCandidates = [...new Set(candidates)].filter((c) => !codes.has(c));
    if (uniqueCandidates.length === 0) continue;

    const existingRows = await db.coupon.findMany({
      where: { code: { in: uniqueCandidates } },
      select: { code: true },
    });
    const existingCodes = new Set(existingRows.map((r) => r.code));
    for (const candidate of uniqueCandidates) {
      if (!existingCodes.has(candidate)) codes.add(candidate);
    }
  }

  if (codes.size < row.count) {
    return { ok: false, error: "לא ניתן היה ליצור מספיק קודים ייחודיים — נסה שוב" };
  }

  const usageLimit = intInputToNullable(row.usageLimitInput);
  const perCustomerLimit = intInputToNullable(row.perCustomerLimitInput);
  const expiresAt = jerusalemLocalToUtc(row.expiresAt);
  const finalCodes = [...codes];

  const result = await db.coupon.createMany({
    data: finalCodes.map((code) => ({
      code,
      promotionId,
      usageLimit,
      perCustomerLimit,
      expiresAt,
      active: true,
    })),
    skipDuplicates: true, // רשת ביטחון אחרונה מול race נדיר בין הבדיקה ליצירה בפועל
  });

  if (result.count < finalCodes.length) {
    // race נדיר: קוד נתפס בין הבדיקה ליצירה. מדווחים בכנות על מה שבאמת נוצר,
    // ולא מתיימרים ש-count המקורי הצליח במלואו.
    const createdRows = await db.coupon.findMany({
      where: { code: { in: finalCodes }, promotionId },
      select: { code: true },
      orderBy: { createdAt: "desc" },
      take: result.count,
    });
    const createdCodes = createdRows.map((r) => r.code);

    await logActivity({
      actorEmail: admin.email,
      action: "coupon.bulk_generate",
      entityType: "promotion",
      entityId: promotionId,
      summary: `${result.count} קודי קופון נוצרו (מתוך ${finalCodes.length} מבוקשים)`,
      metadata: { requested: finalCodes.length, created: result.count },
    });

    revalidatePromotionsPaths();
    return { ok: true, codes: createdCodes };
  }

  await logActivity({
    actorEmail: admin.email,
    action: "coupon.bulk_generate",
    entityType: "promotion",
    entityId: promotionId,
    summary: `${finalCodes.length} קודי קופון נוצרו`,
    metadata: { requested: finalCodes.length, created: finalCodes.length },
  });

  revalidatePromotionsPaths();
  return { ok: true, codes: finalCodes };
}
