import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

// "YYYY-MM-DDTHH:mm" — פורמט הפלט הגולמי של <input type="datetime-local">.
// ריק = לא מתוזמן (מתפרסם מיד עם active). המרה בפועל ל-UTC ב-course-datetime.ts.
const DATETIME_LOCAL_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const optionalDatetimeLocal = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine((v) => !v || DATETIME_LOCAL_PATTERN.test(v), "תאריך/שעה לא תקינים");

export const courseSchema = z.object({
  id: z.string().trim().min(1).optional(),
  // מנוהל דרך כפתורי סדר (למעלה/למטה) בטבלה, לא נערך ידנית בטופס — אופציונלי
  // כאן כדי שה-Sheet לא יצטרך לשלוח אותו; השרת קובע ברירת מחדל (ראה courses.ts).
  order: z.number().int().min(0).max(9999).optional(),
  nameHe: z.string().trim().min(1, "שדה חובה").max(100),
  nameEn: optionalText(100),
  nameAr: optionalText(100),
  descriptionHe: z.string().trim().min(1, "שדה חובה").max(2000),
  descriptionEn: optionalText(2000),
  descriptionAr: optionalText(2000),
  durationHe: z.string().trim().min(1, "שדה חובה").max(60),
  durationEn: optionalText(60),
  durationAr: optionalText(60),
  levelHe: z.string().trim().min(1, "שדה חובה").max(60),
  levelEn: optionalText(60),
  levelAr: optionalText(60),
  // מסחר (Phase 7). מחיר בשקלים (ריק → קורס תדמיתי, לא נמכר). המרה ל-agorot
  // בשרת בלבד (courseShekelsToAgorot), לעולם לא float ב-DB.
  priceShekels: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (v) => !v || (Number.isFinite(Number(v)) && Number(v) > 0 && Number(v) < 1_000_000),
      "מחיר לא תקין",
    ),
  depositPercent: z.number().int().min(0).max(100),
  // "" מהטופס מומר ל-undefined ע"י setValueAs (ראה course-edit-sheet) — כאן מספר אופציונלי.
  capacity: z.number().int().min(1).max(100_000).optional(),
  detailsHe: optionalText(5000),
  detailsEn: optionalText(5000),
  detailsAr: optionalText(5000),
  syllabusHe: optionalText(5000),
  syllabusEn: optionalText(5000),
  syllabusAr: optionalText(5000),
  active: z.boolean(),

  // מחזור חיים + SEO (Platform upgrade, Phase 15 / M3, Stream C). ריק בכל
  // שדה = נופל לערך נגזר (publishAt ריק → מתפרסם מיד; SEO ריק → נופל ל-name/
  // description בזמן generateMetadata, ראה get-courses.ts).
  publishAt: optionalDatetimeLocal,
  seoTitleHe: optionalText(70),
  seoTitleEn: optionalText(70),
  seoTitleAr: optionalText(70),
  seoDescriptionHe: optionalText(300),
  seoDescriptionEn: optionalText(300),
  seoDescriptionAr: optionalText(300),
});

export type CourseInput = z.infer<typeof courseSchema>;

/** המרת שקלים→אגורות לקורס; ריק → null (קורס לא נמכר). בשרת בלבד. */
export function courseShekelsToAgorot(priceShekels: string | undefined): number | null {
  if (!priceShekels) return null;
  return Math.round(Number(priceShekels) * 100);
}
