import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

/** רשימת מזהים ל-sync של טבלאות קישור (מוצרים/קטגוריות זכאים) — לא bulk-action
 * קלאסי, אבל אותה תקרה הגיונית כדי למנוע payload ענק בטעות. */
export const eligibleIdsSchema = z.array(z.string().trim().min(1)).max(500);

/** רשימת מזהים לפעולות bulk (מבצעים/קופונים) — תואם bulkIdsSchema הקיים ב-product-schema.ts. */
export const bulkIdsSchema = z.array(z.string().trim().min(1)).min(1).max(500);

// datetime-local (ללא אזור זמן) — נפרש כשעון קיר בישראל, כמו publishAt של מוצר/קורס.
const DATETIME_LOCAL_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;
const datetimeLocalSchema = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine((value) => !value || DATETIME_LOCAL_PATTERN.test(value), "תאריך/שעה לא תקינים");

/**
 * אחוז מוזן כמחרוזת (0-100, עד 2 ספרות עשרוניות) — מומר בשרת ל-basis points
 * (1000 = 10%) לפני שמירה, לעולם לא כ-float. תואם priceShekelsSchema בעיצובו.
 */
export const percentInputSchema = z
  .string()
  .trim()
  .min(1, "שדה חובה")
  .refine((value) => /^\d{1,3}(\.\d{1,2})?$/.test(value), "אחוז לא תקין")
  .refine((value) => {
    const num = Number(value);
    return Number.isFinite(num) && num >= 0 && num <= 100;
  }, "אחוז חייב להיות בין 0 ל-100");

/** אחוז → נקודות בסיס (10.5% → 1050). קריאה רק לאחר validation מוצלח. */
export function percentToBp(percentInput: string): number {
  return Math.round(Number(percentInput) * 100);
}

/** נקודות בסיס → מחרוזת אחוז לתצוגה בטופס (1050 → "10.5"). */
export function bpToPercentInput(bp: number | null | undefined): string {
  if (bp === null || bp === undefined) return "";
  const value = bp / 100;
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)));
}

/** סכום מוזן בשקלים — כמו priceShekelsSchema, אך מאפשר "" (שדה לא רלוונטי לסוג המבצע הנוכחי). */
export const optionalShekelsSchema = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine((value) => {
    if (!value) return true;
    const num = Number(value);
    return Number.isFinite(num) && num > 0 && num < 1_000_000;
  }, "סכום לא תקין");

/** סכום מינימום/סף — כמו optionalShekelsSchema אך מתיר גם 0 (סף = "0" נפוץ, למשל ללא סף). */
export const optionalMinSubtotalSchema = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine((value) => {
    if (!value) return true;
    const num = Number(value);
    return Number.isFinite(num) && num >= 0 && num < 1_000_000;
  }, "סכום לא תקין");

/** שקלים (מחרוזת, אופציונלי) → אגורות (Int) | null. "" → null. */
export function shekelsToAgorotOrNull(value: string | undefined): number | null {
  if (!value) return null;
  return Math.round(Number(value) * 100);
}

/** אגורות (Int|null, כפי שנשמר ב-DB) → מחרוזת שקלים לעריכה בטופס. null/0 → "" (שדה לא רלוונטי). */
export function agorotToShekelsInput(agorot: number | null | undefined): string {
  if (agorot === null || agorot === undefined) return "";
  const shekels = agorot / 100;
  return Number.isInteger(shekels) ? String(shekels) : shekels.toFixed(2);
}

export const PROMOTION_KINDS = ["PERCENT", "FIXED_AMOUNT", "FREE_SHIPPING"] as const;
export type PromotionKindInput = (typeof PROMOTION_KINDS)[number];

export const PROMOTION_APPLIES_TO = ["SHOP", "COURSES"] as const;

/**
 * פרטי מבצע מלאים — יצירה ועריכה (Sheet), אותה סכימה לשתיהן. שדות הכסף/אחוז
 * מגיעים כמחרוזות (קלט משתמש) ומומרים בשרת לפי kind: PERCENT→percentBp,
 * FIXED_AMOUNT→amountAgorot, FREE_SHIPPING→freeShippingMinSubtotalAgorot.
 * שדות Stage B (priority/stackable) מוצגים כאופציונליים — נשמרים, לא משפיעים
 * על חישוב בפועל בשלב א (המחשבון החי הוא זרם נפרד, evaluate.ts).
 */
export const promotionDetailsSchema = z
  .object({
    name: z.string().trim().min(1, "שדה חובה").max(150),
    description: optionalText(1000),
    kind: z.enum(PROMOTION_KINDS),
    automatic: z.boolean(),
    appliesTo: z.enum(PROMOTION_APPLIES_TO),
    percentInput: optionalShekelsSchema, // ולידציה מדויקת יותר מתבצעת ב-superRefine למטה לפי kind
    amountShekels: optionalShekelsSchema,
    freeShippingMinSubtotalShekels: optionalMinSubtotalSchema,
    minSubtotalShekels: optionalMinSubtotalSchema,
    appliesToSaleItems: z.boolean(),
    startsAt: datetimeLocalSchema,
    endsAt: datetimeLocalSchema,
    active: z.boolean(),
    priority: z.number().int().min(0).max(1000).optional(),
    stackable: z.boolean().optional(),
    eligibleProductIds: eligibleIdsSchema.optional(),
    eligibleCategoryIds: eligibleIdsSchema.optional(),
  })
  .superRefine((row, ctx) => {
    if (row.kind === "PERCENT") {
      if (!row.percentInput || !/^\d{1,3}(\.\d{1,2})?$/.test(row.percentInput)) {
        ctx.addIssue({ code: "custom", path: ["percentInput"], message: "אחוז לא תקין" });
      } else {
        const num = Number(row.percentInput);
        if (!(num >= 0 && num <= 100)) {
          ctx.addIssue({ code: "custom", path: ["percentInput"], message: "אחוז חייב להיות בין 0 ל-100" });
        }
      }
    }
    if (row.kind === "FIXED_AMOUNT" && !row.amountShekels) {
      ctx.addIssue({ code: "custom", path: ["amountShekels"], message: "שדה חובה" });
    }
    if (row.startsAt && row.endsAt) {
      // השוואה מחרוזתית תקינה: שני הפורמטים זהים (YYYY-MM-DDTHH:mm), אין צורך בהמרה.
      if (row.endsAt < row.startsAt) {
        ctx.addIssue({ code: "custom", path: ["endsAt"], message: "תאריך סיום חייב להיות אחרי תאריך התחלה" });
      }
    }
  });

export type PromotionDetailsInput = z.infer<typeof promotionDetailsSchema>;

/**
 * פרטי קופון — code מנורמל (UPPERCASE, ללא רווחים) בשרת. usageLimit/perCustomerLimit
 * ריקים = ללא הגבלה (null). minSubtotalAgorot אופציונלי — override על ה-Promotion.
 */
export const couponDetailsSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, "קוד חייב להכיל לפחות 3 תווים")
      .max(40, "קוד ארוך מדי")
      .regex(/^[A-Za-z0-9_-]+$/, "קוד יכול להכיל רק אותיות/ספרות באנגלית, מקף וקו תחתון"),
    usageLimitInput: z
      .string()
      .trim()
      .optional()
      .or(z.literal(""))
      .refine((value) => !value || (Number.isInteger(Number(value)) && Number(value) > 0), "מספר לא תקין"),
    perCustomerLimitInput: z
      .string()
      .trim()
      .optional()
      .or(z.literal(""))
      .refine((value) => !value || (Number.isInteger(Number(value)) && Number(value) > 0), "מספר לא תקין"),
    minSubtotalShekels: optionalMinSubtotalSchema,
    startsAt: datetimeLocalSchema,
    expiresAt: datetimeLocalSchema,
    active: z.boolean(),
  })
  .superRefine((row, ctx) => {
    if (row.startsAt && row.expiresAt && row.expiresAt < row.startsAt) {
      ctx.addIssue({ code: "custom", path: ["expiresAt"], message: "תאריך תפוגה חייב להיות אחרי תאריך התחלה" });
    }
  });

export type CouponDetailsInput = z.infer<typeof couponDetailsSchema>;

/** מחרוזת מספר שלם אופציונלית → Int | null. "" → null. */
export function intInputToNullable(value: string | undefined): number | null {
  if (!value) return null;
  return Math.trunc(Number(value));
}

/** יצירת קופונים בכמות — קידומת אופציונלית, אורך קוד, וכמות (מוגבל ל-500 כמו bulkIdsSchema). */
export const generateCouponsSchema = z.object({
  count: z.number().int().min(1, "כמות חייבת להיות לפחות 1").max(500, "מקסימום 500 קודים בפעולה אחת"),
  prefix: z
    .string()
    .trim()
    .max(20)
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || /^[A-Za-z0-9_-]+$/.test(value), "קידומת יכולה להכיל רק אותיות/ספרות באנגלית"),
  codeLength: z.number().int().min(4).max(20).optional(),
  usageLimitInput: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || (Number.isInteger(Number(value)) && Number(value) > 0), "מספר לא תקין"),
  perCustomerLimitInput: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || (Number.isInteger(Number(value)) && Number(value) > 0), "מספר לא תקין"),
  expiresAt: datetimeLocalSchema,
});

export type GenerateCouponsInput = z.infer<typeof generateCouponsSchema>;
