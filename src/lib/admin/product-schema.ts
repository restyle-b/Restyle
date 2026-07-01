import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

// http/https בלבד — מונע הזרקת javascript:/data: ב-<img src> (XSS) וכן
// SSRF-style ניצול (כמו gallery-schema.ts, imageUrl כאן אופציונלי).
const optionalUrl = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .or(z.literal(""))
  .refine(
    (value) => {
      if (!value) return true;
      try {
        return ["http:", "https:"].includes(new URL(value).protocol);
      } catch {
        return false;
      }
    },
    { message: "כתובת לא תקינה — נדרש קישור http/https" },
  );

export const productSchema = z.object({
  id: z.string().trim().min(1).optional(),
  slug: z
    .string()
    .trim()
    .min(1, "שדה חובה")
    .max(60)
    .regex(/^[a-z0-9-]+$/, "מותרות אותיות אנגליות קטנות, ספרות ומקף בלבד"),
  order: z.number().int().min(0).max(9999),
  nameHe: z.string().trim().min(1, "שדה חובה").max(100),
  nameEn: optionalText(100),
  nameAr: optionalText(100),
  descriptionHe: z.string().trim().min(1, "שדה חובה").max(2000),
  descriptionEn: optionalText(2000),
  descriptionAr: optionalText(2000),
  // מחיר מוזן בשקלים (עם או בלי עשרוני) — מומר ל-agorot Int בשרת
  // (Math.round(value*100)) לפני שמירה, לעולם לא נשמר כ-float.
  priceShekels: z
    .string()
    .trim()
    .min(1, "שדה חובה")
    .refine((value) => {
      const num = Number(value);
      return Number.isFinite(num) && num > 0 && num < 1_000_000;
    }, "מחיר לא תקין"),
  stock: z.number().int().min(0).max(1_000_000),
  imageUrl: optionalUrl,
  categoryId: z.string().trim().min(1).optional().or(z.literal("")),
  active: z.boolean(),
});

export type ProductInput = z.infer<typeof productSchema>;

/** המרה חד-כיוונית שקלים→אגורות עם עיגול, לשימוש בשרת בלבד. */
export function shekelsToAgorot(priceShekels: string): number {
  return Math.round(Number(priceShekels) * 100);
}
