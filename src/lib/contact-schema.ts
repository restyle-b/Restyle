import { z } from "zod";

export type ContactSchemaMessages = {
  nameTooShort: string;
  emailInvalid: string;
  messageTooShort: string;
};

export function createContactSchema(messages: ContactSchemaMessages) {
  return z.object({
    name: z.string().trim().min(2, messages.nameTooShort).max(100),
    email: z.string().trim().email(messages.emailInvalid),
    phone: z.string().trim().max(20).optional().or(z.literal("")),
    message: z.string().trim().min(10, messages.messageTooShort).max(2000),
    /** שדה honeypot — אמור להישאר ריק; בוטים ממלאים אותו */
    company: z.string().max(0).optional().or(z.literal("")),
  });
}

export type ContactInput = z.infer<ReturnType<typeof createContactSchema>>;
