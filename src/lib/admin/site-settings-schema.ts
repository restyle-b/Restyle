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

// דמי משלוח מוזנים בשקלים (עם או בלי עשרוני) — מומרים ל-agorot Int בשרת לפני
// שמירה, לעולם לא נשמרים כ-float. תואם את priceShekelsSchema ב-product-schema.ts,
// אך מאפשר 0 (משלוח חינם) ומוגבל לתקרה סבירה של דמי משלוח (לא מחיר מוצר).
export const shippingFeeShekelsSchema = z
  .string()
  .trim()
  .min(1, "שדה חובה")
  .refine((value) => {
    const num = Number(value);
    return Number.isFinite(num) && num >= 0 && num <= 1000;
  }, "דמי משלוח לא תקינים (0 עד 1000 ש\"ח)");

// סף מלאי נמוך — כמות יחידות (לא כסף), מספר שלם לא שלילי.
export const lowStockThresholdSchema = z
  .string()
  .trim()
  .min(1, "שדה חובה")
  .refine((value) => {
    const num = Number(value);
    return Number.isInteger(num) && num >= 0 && num <= 1000;
  }, "סף מלאי נמוך לא תקין (0 עד 1000 יחידות)");

// שני השדות אופציונליים ברמת הסכימה המשותפת: טופס פרטי הקשר (SiteSettingsForm)
// ממשיך לשלוח רק את שדותיו-שלו בלי לגעת בהם (updateSiteSettings משאיר את
// העמודות בטבלה כפי שהן כשהשדה חסר מה-input). טופס "משלוח ומלאי" הוא זה
// שמזין אותם בפועל — ראה shippingSettingsSchema למטה.
export const siteSettingsSchema = z.object({
  phone: phoneLike(30),
  email: z.string().trim().email("אימייל לא תקין").max(200),
  address: z.string().trim().min(1, "שדה חובה").max(300),
  whatsapp: phoneLike(30),
  instagramUrl: optionalUrl,
  facebookUrl: optionalUrl,
  appStoreUrl: optionalUrl,
  googlePlayUrl: optionalUrl,
  shippingFeeShekels: shippingFeeShekelsSchema.optional(),
  lowStockThreshold: lowStockThresholdSchema.optional(),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;

// תת-סכימה לטופס "משלוח ומלאי" בלבד — שני השדות הופכים לחובה (required()
// מבטל את ה-optional של הסכימה המשותפת), כדי שהטופס יאמת אותם תמיד.
export const shippingSettingsSchema = siteSettingsSchema
  .pick({ shippingFeeShekels: true, lowStockThreshold: true })
  .required();

export type ShippingSettingsInput = z.infer<typeof shippingSettingsSchema>;

/** המרה חד-כיוונית שקלים→אגורות עם עיגול, לשימוש בשרת בלבד (תואם shekelsToAgorot ב-product-schema.ts). */
export function shippingFeeShekelsToAgorot(shippingFeeShekels: string): number {
  return Math.round(Number(shippingFeeShekels) * 100);
}

// "HH:MM" בפורמט 24 שעות — ניטרלי-שפה, לא דורש שכפול He/En/Ar.
const timeString = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "פורמט שעה לא תקין (HH:MM)");

export const openingHourSchema = z
  .object({
    dayOrder: z.number().int().min(0).max(6),
    closed: z.boolean(),
    openTime: timeString.optional().or(z.literal("")),
    closeTime: timeString.optional().or(z.literal("")),
  })
  .refine((row) => row.closed || (row.openTime && row.closeTime), {
    message: "יש להזין שעת פתיחה וסגירה, או לסמן 'סגור'",
  });

export type OpeningHourInput = z.infer<typeof openingHourSchema>;

export const openingHoursSchema = z.array(openingHourSchema).length(7);
