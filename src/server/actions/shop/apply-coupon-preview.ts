"use server";

import { z } from "zod";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { db } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cartItemsSchema } from "@/lib/checkout/checkout-schema";
import { getShippingFeeAgorot } from "@/lib/checkout/shipping";
import { getEffectivePriceAgorot } from "@/lib/shop/pricing";
import { evaluatePromotions, type AppliedPromotion, type EvalLine } from "@/lib/promotions/evaluate";
import { fetchActiveAutomaticPromotions, fetchCouponRowByCode } from "@/lib/promotions/fetch-promotion-data";

export type ApplyCouponPreviewResult =
  | {
      ok: true;
      subtotalAgorot: number;
      discountAgorot: number;
      shippingAgorot: number;
      freeShipping: boolean;
      totalAgorot: number;
      appliedPromotions: AppliedPromotion[];
    }
  | { ok: false; error: string };

const couponPreviewInputSchema = z.object({
  code: z.string().trim().min(1).max(40),
  deliveryMethod: z.enum(["PICKUP", "DELIVERY"]),
});

/**
 * תצוגה מקדימה של הנחת קופון — **לא-אוטוריטטיבית**, לפידבק חי בזמן שהלקוח
 * מקליד קוד קופון בעגלה/צ'קאאוט. לא נועלת שום שורה ב-DB, לא יוצרת
 * CouponRedemption, לא סופרת שימוש כלפי מגבלה — המקור היחיד לאמת הוא
 * create-order.ts, שמריץ את אותה evaluatePromotions בתוך טרנזקציה נעולה
 * (FOR UPDATE). ראה docs/features/platform-upgrade/promotion-engine.md §6.
 *
 * rate-limit באותה דיסציפלינה בדיוק כמו checkout/enroll (5/דקה לפי IP) —
 * כדי שלא יהפוך לאורקל לאנומרציית קודי קופון (ניחוש-וטעייה על קודים).
 */
export async function applyCouponPreview(
  input: unknown,
  cartInput: unknown,
  locale: string,
): Promise<ApplyCouponPreviewResult> {
  const resolvedLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const t = await getTranslations({ locale: resolvedLocale, namespace: "checkout.errors" });

  const ip = await getClientIp();
  if (!rateLimit(`coupon-preview:${ip}`, 5, 60_000).ok) {
    return { ok: false, error: t("rateLimited") };
  }

  const parsedInput = couponPreviewInputSchema.safeParse(input);
  if (!parsedInput.success) {
    return { ok: false, error: t("invalidInput") };
  }

  const parsedCart = cartItemsSchema.safeParse(cartInput);
  if (!parsedCart.success) {
    return { ok: false, error: t("emptyCart") };
  }

  // חישוב מחיר בשרת בלבד — אותה דיסציפלינת re-fetch בדיוק כמו create-order:
  // לעולם לא נסמכים על מחיר/שם מהקליינט, גם כאן (§6).
  const productIds = parsedCart.data.map((i) => i.productId);
  const products = await db.product.findMany({
    where: {
      id: { in: productIds },
      active: true,
      available: true,
      OR: [{ publishAt: null }, { publishAt: { lte: new Date() } }],
    },
  });
  const productsById = new Map(products.map((p) => [p.id, p]));

  const evalLines: EvalLine[] = [];
  for (const line of parsedCart.data) {
    const product = productsById.get(line.productId);
    if (!product) {
      return { ok: false, error: t("productUnavailable") };
    }
    evalLines.push({
      productId: product.id,
      quantity: line.quantity,
      unitPriceAgorot: getEffectivePriceAgorot(product.priceAgorot, product.salePriceAgorot),
      categoryId: product.categoryId,
    });
  }

  const now = new Date();

  const [shippingFeeAgorot, automaticPromotions, couponRow] = await Promise.all([
    parsedInput.data.deliveryMethod === "DELIVERY" ? getShippingFeeAgorot(db) : Promise.resolve(0),
    fetchActiveAutomaticPromotions(db, now),
    fetchCouponRowByCode(db, parsedInput.data.code),
  ]);

  if (!couponRow) {
    return { ok: false, error: t("couponNotFound") };
  }

  // מגבלת שימוש-ללקוח: preview נקרא לפני/תוך-כדי מילוי טופס הצ'קאאוט, לרוב
  // בלי email ידוע עדיין. אם המשתמש מחובר סופרים לפי userId (אינדיקציה
  // best-effort, לא 100% מדויקת); לאורח מוצג 0 — האכיפה האמיתית תמיד קורית
  // ב-create-order בתוך הטרנזקציה הנעולה, לפי email מנורמל (§5.6).
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id ?? null;

  const [couponTotalUsed, couponPerCustomerUsed] = await Promise.all([
    db.couponRedemption.count({ where: { couponId: couponRow.id } }),
    userId ? db.couponRedemption.count({ where: { couponId: couponRow.id, userId } }) : Promise.resolve(0),
  ]);

  const evalResult = evaluatePromotions({
    lines: evalLines,
    automaticPromotions,
    coupon: couponRow,
    now,
    customer: { emailNormalized: "", userId },
    shipping: { method: parsedInput.data.deliveryMethod, feeAgorot: shippingFeeAgorot },
    usage: { couponTotalUsed, couponPerCustomerUsed },
  });

  if (evalResult.rejections.length > 0) {
    return { ok: false, error: evalResult.rejections[0]?.reason ?? t("couponInvalid") };
  }

  return {
    ok: true,
    subtotalAgorot: evalResult.subtotalAgorot,
    discountAgorot: evalResult.discountAgorot,
    shippingAgorot: evalResult.shippingAgorot,
    freeShipping: evalResult.freeShipping,
    totalAgorot: evalResult.totalAgorot,
    appliedPromotions: evalResult.appliedPromotions,
  };
}
