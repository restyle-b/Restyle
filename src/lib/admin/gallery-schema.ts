import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

// http/https בלבד — מונע הזרקת javascript:/data: ב-<img src> (XSS) וכן
// SSRF-style ניצול בעת fetch עתידי של התמונה ע"י R2/CDN.
const requiredUrl = z
  .string()
  .trim()
  .min(1, "שדה חובה")
  .max(2000)
  .refine(
    (value) => {
      try {
        return ["http:", "https:"].includes(new URL(value).protocol);
      } catch {
        return false;
      }
    },
    { message: "כתובת לא תקינה — נדרש קישור http/https" },
  );

export const galleryImageSchema = z.object({
  id: z.string().trim().min(1).optional(),
  order: z.number().int().min(0).max(9999),
  imageUrl: requiredUrl,
  altHe: z.string().trim().min(1, "שדה חובה").max(200),
  altEn: optionalText(200),
  altAr: optionalText(200),
  active: z.boolean(),
});

export type GalleryImageInput = z.infer<typeof galleryImageSchema>;
