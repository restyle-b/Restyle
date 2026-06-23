import { z } from "zod";

const optionalText = z.string().trim().max(5000).optional().or(z.literal(""));

// תווים מותרים בלבד (אין נקודה — ה-key הוא מקטע יחיד, לא path), ושלילת שמות
// השמורים ל-JS object prototype — הגנת-עומק מול prototype pollution דרך
// setPath/deepMerge ב-lib/content/get-content-overrides.ts (ה-key מגיע מ-DB
// שנכתב רק ע"י admin מאומת, אבל ההגנה הזו לא תלויה בכך).
const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);
const keySchema = z
  .string()
  .trim()
  .min(1)
  .max(200)
  .regex(/^[a-zA-Z0-9_-]+$/, "מותרים רק אותיות/מספרים/מקף/קו תחתון")
  .refine((value) => !FORBIDDEN_KEYS.has(value), "key שמור, לא ניתן לשימוש");

export const contentBlockSchema = z.object({
  key: keySchema,
  valueHe: z.string().trim().min(1, "שדה חובה").max(5000),
  valueEn: optionalText,
  valueAr: optionalText,
});

export type ContentBlockInput = z.infer<typeof contentBlockSchema>;

export const contentBlocksSchema = z.array(contentBlockSchema).max(200);
