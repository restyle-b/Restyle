import { z } from "zod";

export type ProfileSchemaMessages = {
  nameTooShort: string;
  phoneTooShort: string;
};

/** Factory כמו createCheckoutSchema — הודעות שגיאה מגיעות מ-next-intl (שרת+לקוח). */
export function createProfileSchema(messages: ProfileSchemaMessages) {
  return z.object({
    name: z.string().trim().min(2, messages.nameTooShort).max(100),
    phone: z.string().trim().min(7, messages.phoneTooShort).max(20),
  });
}

export type ProfileInput = z.infer<ReturnType<typeof createProfileSchema>>;
