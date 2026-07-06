/**
 * שכבת גישה ל-DB עבור מנוע המבצעים/קופונים — ממיר שורות Prisma לצורות
 * המנורמלות שמצפה להן src/lib/promotions/evaluate.ts (PromotionRow/CouponRow).
 *
 * מקבל client גנרי (db הרגיל או tx בתוך טרנזקציה) כדי שאותו קוד ישרת גם את
 * preview הלא-אוטוריטטיבי (db רגיל) וגם את create-order האוטוריטטיבי (tx).
 * בכוונה **לא** מסנן לפי active/appliesTo/חלון תוקף בשאילתת הקופון עצמה —
 * שולפים את השורה כמות שהיא ומעבירים ל-evaluatePromotions, שכבר יודע להפיק
 * סיבת דחייה מדויקת (פג תוקף/לא פעיל/appliesTo!=SHOP/וכו') במקום "לא נמצא"
 * גנרי. ראה docs/features/platform-upgrade/promotion-engine.md §1,§4,§5.
 */

import type { db } from "@/lib/db";
import type { CouponRow, PromotionRow } from "@/lib/promotions/evaluate";

/** מספיק לשתי הפעולות (promotion/coupon) — תואם מבנית גם ל-db וגם ל-Prisma.TransactionClient. */
export type PromotionDbClient = Pick<typeof db, "promotion" | "coupon">;

type PromotionWithEligibility = {
  id: string;
  name: string;
  kind: string;
  appliesTo: string;
  percentBp: number | null;
  amountAgorot: number | null;
  minSubtotalAgorot: number | null;
  freeShippingMinSubtotalAgorot: number | null;
  startsAt: Date | null;
  endsAt: Date | null;
  active: boolean;
  priority: number;
  eligibleProducts: { productId: string }[];
  eligibleCategories: { categoryId: string }[];
};

function toPromotionRow(promotion: PromotionWithEligibility, code: string | null): PromotionRow {
  return {
    id: promotion.id,
    code,
    name: promotion.name,
    kind: promotion.kind as PromotionRow["kind"],
    appliesTo: promotion.appliesTo as PromotionRow["appliesTo"],
    percentBp: promotion.percentBp,
    amountAgorot: promotion.amountAgorot,
    minSubtotalAgorot: promotion.minSubtotalAgorot,
    freeShippingMinSubtotalAgorot: promotion.freeShippingMinSubtotalAgorot,
    eligibleProductIds: promotion.eligibleProducts.map((p) => p.productId),
    eligibleCategoryIds: promotion.eligibleCategories.map((c) => c.categoryId),
    startsAt: promotion.startsAt,
    endsAt: promotion.endsAt,
    active: promotion.active,
    priority: promotion.priority,
  };
}

/**
 * מבצעים אוטומטיים פעילים כרגע (SHOP בלבד) — ה-evaluator בכל זאת בודק שוב
 * active/appliesTo/חלון (הגנת-עומק), אבל מסננים כאן כדי לא לגרור החוצה
 * שורות היסטוריות/כבויות/COURSES שאין להן שום סיכוי להשפיע.
 */
export async function fetchActiveAutomaticPromotions(
  client: PromotionDbClient,
  now: Date,
): Promise<PromotionRow[]> {
  const promotions = await client.promotion.findMany({
    where: {
      automatic: true,
      active: true,
      appliesTo: "SHOP",
      OR: [{ startsAt: null }, { startsAt: { lte: now } }],
      AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
    },
    include: { eligibleProducts: true, eligibleCategories: true },
  });
  return promotions.map((p) => toPromotionRow(p, null));
}

/**
 * קופון לפי קוד — התאמה ללא רגישות לרישיות (חוויית משתמש: "summer10" ו-
 * "SUMMER10" זהים). מחזיר null רק אם השורה לא קיימת בכלל; **לא** מסנן לפי
 * active/תוקף — זה תפקיד ה-evaluator (ראה תיעוד הקובץ למעלה).
 */
export async function fetchCouponRowByCode(client: PromotionDbClient, code: string): Promise<CouponRow | null> {
  const coupon = await client.coupon.findFirst({
    where: { code: { equals: code, mode: "insensitive" } },
    include: {
      promotion: { include: { eligibleProducts: true, eligibleCategories: true } },
    },
  });
  if (!coupon) return null;
  return {
    id: coupon.id,
    code: coupon.code,
    active: coupon.active,
    startsAt: coupon.startsAt,
    expiresAt: coupon.expiresAt,
    usageLimit: coupon.usageLimit,
    perCustomerLimit: coupon.perCustomerLimit,
    minSubtotalAgorot: coupon.minSubtotalAgorot,
    promotion: toPromotionRow(coupon.promotion, coupon.code),
  };
}
