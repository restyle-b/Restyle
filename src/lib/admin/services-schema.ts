import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

export const serviceSchema = z.object({
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
  active: z.boolean(),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
