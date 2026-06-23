import { z } from "zod";

const optionalText = z.string().trim().max(5000).optional().or(z.literal(""));

export const contentBlockSchema = z.object({
  key: z.string().trim().min(1).max(200),
  valueHe: z.string().trim().min(1, "שדה חובה").max(5000),
  valueEn: optionalText,
  valueAr: optionalText,
});

export type ContentBlockInput = z.infer<typeof contentBlockSchema>;

export const contentBlocksSchema = z.array(contentBlockSchema).max(200);
