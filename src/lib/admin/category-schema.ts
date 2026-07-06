import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

/**
 * סכימת יצירה/עריכה של קטגוריה בודדת (Sheet) — מחליפה את הסכימה הישנה
 * מבוססת-המערך (categorySchema.array()) ששימשה את updateCategories הישן
 * (delete-by-omission: שליחה בלי שורה מחקה אותה בשקט).
 */
export const categoryDetailsSchema = z.object({
  nameHe: z.string().trim().min(1, "שדה חובה").max(100),
  nameEn: optionalText(100),
  nameAr: optionalText(100),
  order: z.number().int().min(0).max(9999),
  active: z.boolean(),
});

export type CategoryDetailsInput = z.infer<typeof categoryDetailsSchema>;
