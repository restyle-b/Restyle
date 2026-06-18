import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "שם קצר מדי").max(100),
  email: z.string().trim().email("כתובת אימייל לא תקינה"),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  message: z.string().trim().min(10, "ההודעה קצרה מדי").max(2000),
  /** שדה honeypot — אמור להישאר ריק; בוטים ממלאים אותו */
  company: z.string().max(0).optional().or(z.literal("")),
});

export type ContactInput = z.infer<typeof contactSchema>;
