import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

export const categorySchema = z.object({
  id: z.string().trim().min(1).optional(),
  order: z.number().int().min(0).max(9999),
  nameHe: z.string().trim().min(1, "שדה חובה").max(100),
  nameEn: optionalText(100),
  nameAr: optionalText(100),
  active: z.boolean(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
