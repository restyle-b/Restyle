import { z } from "zod";

export type AddressSchemaMessages = {
  labelRequired: string;
  lineRequired: string;
  cityRequired: string;
};

/** Factory כמו createCheckoutSchema/createProfileSchema — הודעות שגיאה מ-next-intl. */
export function createAddressSchema(messages: AddressSchemaMessages) {
  return z.object({
    label: z.string().trim().min(1, messages.labelRequired).max(50),
    line: z.string().trim().min(1, messages.lineRequired).max(200),
    city: z.string().trim().min(1, messages.cityRequired).max(100),
    notes: z.string().trim().max(500).optional().or(z.literal("")),
    // בלי .default() בכוונה — .default() משנה את טיפוס ה-input (יוצר אי-התאמה
    // מול useForm<AddressInput> ב-react-hook-form, כמו ב-checkout-schema.ts).
    // undefined מטופל כ-false בצד הקורא (server action).
    isDefault: z.boolean().optional(),
  });
}

export type AddressInput = z.infer<ReturnType<typeof createAddressSchema>>;
