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

// מחיר מוזן בשקלים (עם או בלי עשרוני) — מומר ל-agorot Int בשרת לפני שמירה,
// לעולם לא נשמר כ-float. משותף למחיר רגיל ולמחיר מבצע (inline ו-Sheet).
export const priceShekelsSchema = z
  .string()
  .trim()
  .min(1, "שדה חובה")
  .refine((value) => {
    const num = Number(value);
    return Number.isFinite(num) && num > 0 && num < 1_000_000;
  }, "מחיר לא תקין");

export const stockQuantitySchema = z.number().int().min(0).max(1_000_000);

// datetime-local (ללא שנייה בד"כ, אבל מקבלים גם עם) — ללא אזור זמן; מפורש
// תמיד כשעון קיר בישראל (ראו jerusalemLocalToUtc למטה). ריק = לא מתוזמן.
const DATETIME_LOCAL_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;
const publishAtSchema = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine((value) => !value || DATETIME_LOCAL_PATTERN.test(value), "תאריך/שעה לא תקינים");

/** רשימת מזהים לפעולות bulk — מוגבלת כדי למנוע updateMany/deleteMany ענקי בטעות. */
export const bulkIdsSchema = z.array(z.string().trim().min(1)).min(1).max(500);

/** פרטי מוצר מלאים — יצירה (quick-add) ועריכה מלאה (Sheet), לא inline. */
export const productDetailsSchema = z.object({
  order: z.number().int().min(0).max(9999),
  nameHe: z.string().trim().min(1, "שדה חובה").max(100),
  nameEn: optionalText(100),
  nameAr: optionalText(100),
  descriptionHe: z.string().trim().min(1, "שדה חובה").max(2000),
  descriptionEn: optionalText(2000),
  descriptionAr: optionalText(2000),
  priceShekels: priceShekelsSchema,
  stock: stockQuantitySchema,
  imageUrl: optionalUrl,
  categoryId: z.string().trim().min(1).optional().or(z.literal("")),
  active: z.boolean(),
  publishAt: publishAtSchema,
  seoTitleHe: optionalText(70),
  seoTitleEn: optionalText(70),
  seoTitleAr: optionalText(70),
  seoDescriptionHe: optionalText(300),
  seoDescriptionEn: optionalText(300),
  seoDescriptionAr: optionalText(300),
});

export type ProductDetailsInput = z.infer<typeof productDetailsSchema>;

// ── Asia/Jerusalem ⇄ UTC ──
// datetime-local לא נושא אזור זמן — הקלט/פלט הוא תמיד שעון קיר בישראל.
// ה-offset (+2 בחורף, +3 בקיץ ל-DST) מחושב דרך Intl per-instant, לא קבוע,
// כדי לא לשבור סביב מעברי שעון קיץ/חורף (הבאג הכי סביר לפי תוכנית ה-M3).
const JERUSALEM_TZ = "Asia/Jerusalem";

function getTimeZoneOffsetMs(instantMs: number, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts: Record<string, string> = {};
  for (const part of dtf.formatToParts(new Date(instantMs))) {
    if (part.type !== "literal") parts[part.type] = part.value;
  }
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  return asUtc - instantMs;
}

/**
 * ממיר מחרוזת datetime-local ("YYYY-MM-DDTHH:mm[:ss]"), מפורשת כשעון קיר
 * בישראל, ל-Date UTC. מחזיר null עבור קלט ריק/לא תקין. שתי איטרציות כדי
 * לצמצם טעות ליד גבול מעבר שעון קיץ/חורף (offset עצמו תלוי ב-instant).
 */
export function jerusalemLocalToUtc(value: string | null | undefined): Date | null {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/.exec(trimmed);
  if (!match) return null;

  const [, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr] = match;
  const guess = Date.UTC(
    Number(yearStr),
    Number(monthStr) - 1,
    Number(dayStr),
    Number(hourStr),
    Number(minuteStr),
    Number(secondStr ?? "0"),
  );

  const offset1 = getTimeZoneOffsetMs(guess, JERUSALEM_TZ);
  const offset2 = getTimeZoneOffsetMs(guess - offset1, JERUSALEM_TZ);
  return new Date(guess - offset2);
}

/**
 * ממיר Date (UTC, כפי שנשמר ב-DB) למחרוזת datetime-local בשעון ישראל,
 * לתצוגה בשדה input[type=datetime-local]. null/undefined → "" (לא מתוזמן).
 */
export function utcToJerusalemLocal(date: Date | null | undefined): string {
  if (!date) return "";
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: JERUSALEM_TZ,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  const parts: Record<string, string> = {};
  for (const part of dtf.formatToParts(date)) {
    if (part.type !== "literal") parts[part.type] = part.value;
  }
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

/** המרה חד-כיוונית שקלים→אגורות עם עיגול, לשימוש בשרת בלבד. */
export function shekelsToAgorot(priceShekels: string): number {
  return Math.round(Number(priceShekels) * 100);
}

/** בריאות מלאי נגזרת — לא מאוחסנת. סף "מלאי נמוך" קבוע בכוונה (v1). */
export const LOW_STOCK_THRESHOLD = 5;

export type StockHealth = "out" | "low" | "healthy";

export function getStockHealth(stock: number): StockHealth {
  if (stock <= 0) return "out";
  if (stock <= LOW_STOCK_THRESHOLD) return "low";
  return "healthy";
}
