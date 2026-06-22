import { z } from "zod";

// מגביל ל-http/https בלבד — נמנע מ-stored-XSS דרך javascript:/data: שיוטמע
// בעתיד כ-<a href> בעמודים הציבוריים (השדות האלה הם קישורי רשתות חברתיות/חנויות אפליקציה).
const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .refine(
    (value) => {
      try {
        return ["http:", "https:"].includes(new URL(value).protocol);
      } catch {
        return false;
      }
    },
    { message: "כתובת לא תקינה — נדרש קישור http/https" },
  )
  .optional()
  .or(z.literal(""));

// טלפון/וואטסאפ מוטמעים גולמית בקישורי tel:/wa.me בצד הציבורי (contact-links.ts) —
// מגבילים לתווים תקינים בלבד (ספרות/+/רווח/מקף/סוגריים) כדי למנוע הזרקת תווים
// לכתובת ה-URI כשנחבר את השדה הזה לאתר הציבורי.
const phoneLike = (max: number) =>
  z
    .string()
    .trim()
    .min(1, "שדה חובה")
    .max(max)
    .regex(/^[\d+\-() ]+$/, "מותרות ספרות, רווחים, +, - וסוגריים בלבד");

export const siteSettingsSchema = z.object({
  phone: phoneLike(30),
  email: z.string().trim().email("אימייל לא תקין").max(200),
  address: z.string().trim().min(1, "שדה חובה").max(300),
  whatsapp: phoneLike(30),
  instagramUrl: optionalUrl,
  facebookUrl: optionalUrl,
  appStoreUrl: optionalUrl,
  googlePlayUrl: optionalUrl,
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;

const optionalText = z.string().trim().max(100).optional().or(z.literal(""));

export const openingHourSchema = z.object({
  id: z.number().int().optional(),
  dayOrder: z.number().int().min(0).max(6),
  dayHe: z.string().trim().min(1, "שדה חובה").max(50),
  dayEn: optionalText,
  dayAr: optionalText,
  hoursHe: z.string().trim().min(1, "שדה חובה").max(100),
  hoursEn: optionalText,
  hoursAr: optionalText,
});

export type OpeningHourInput = z.infer<typeof openingHourSchema>;

export const openingHoursSchema = z.array(openingHourSchema).max(7);
