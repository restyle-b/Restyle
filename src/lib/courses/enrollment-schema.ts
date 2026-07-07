import { z } from "zod";

export type EnrollSchemaMessages = {
  nameTooShort: string;
  emailInvalid: string;
  phoneTooShort: string;
};

export function createEnrollSchema(messages: EnrollSchemaMessages) {
  return z.object({
    customerName: z.string().trim().min(2, messages.nameTooShort).max(100),
    customerEmail: z.string().trim().email(messages.emailInvalid),
    customerPhone: z.string().trim().min(7, messages.phoneTooShort).max(20),
    courseId: z.string().trim().min(1),
    plan: z.enum(["DEPOSIT", "FULL"]),
    /** honeypot — אמור להישאר ריק; בוטים ממלאים אותו */
    company: z.string().max(0).optional().or(z.literal("")),
  });
}

export type EnrollInput = z.infer<ReturnType<typeof createEnrollSchema>>;
