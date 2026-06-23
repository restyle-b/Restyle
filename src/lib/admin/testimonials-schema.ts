import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

export const testimonialSchema = z.object({
  id: z.string().trim().min(1).optional(),
  order: z.number().int().min(0).max(9999),
  nameHe: z.string().trim().min(1, "שדה חובה").max(100),
  nameEn: optionalText(100),
  nameAr: optionalText(100),
  quoteHe: z.string().trim().min(1, "שדה חובה").max(1000),
  quoteEn: optionalText(1000),
  quoteAr: optionalText(1000),
  active: z.boolean(),
});

export type TestimonialInput = z.infer<typeof testimonialSchema>;
