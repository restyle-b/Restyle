import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .url("כתובת לא תקינה")
  .optional()
  .or(z.literal(""));

export const siteSettingsSchema = z.object({
  phone: z.string().trim().min(1, "שדה חובה").max(30),
  email: z.string().trim().email("אימייל לא תקין").max(200),
  address: z.string().trim().min(1, "שדה חובה").max(300),
  whatsapp: z.string().trim().min(1, "שדה חובה").max(30),
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
