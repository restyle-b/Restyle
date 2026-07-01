import { z } from "zod";

export type CheckoutSchemaMessages = {
  nameTooShort: string;
  emailInvalid: string;
  phoneTooShort: string;
  addressRequired: string;
  cityRequired: string;
};

export function createCheckoutSchema(messages: CheckoutSchemaMessages) {
  return z
    .object({
      customerName: z.string().trim().min(2, messages.nameTooShort).max(100),
      customerEmail: z.string().trim().email(messages.emailInvalid),
      customerPhone: z.string().trim().min(7, messages.phoneTooShort).max(20),
      deliveryMethod: z.enum(["PICKUP", "DELIVERY"]),
      addressLine: z.string().trim().max(200).optional().or(z.literal("")),
      addressCity: z.string().trim().max(100).optional().or(z.literal("")),
      addressNotes: z.string().trim().max(500).optional().or(z.literal("")),
      /** שדה honeypot — אמור להישאר ריק; בוטים ממלאים אותו */
      company: z.string().max(0).optional().or(z.literal("")),
    })
    .superRefine((data, ctx) => {
      if (data.deliveryMethod === "DELIVERY") {
        if (!data.addressLine) {
          ctx.addIssue({ code: "custom", message: messages.addressRequired, path: ["addressLine"] });
        }
        if (!data.addressCity) {
          ctx.addIssue({ code: "custom", message: messages.cityRequired, path: ["addressCity"] });
        }
      }
    });
}

export type CheckoutInput = z.infer<ReturnType<typeof createCheckoutSchema>>;

/** פריטי העגלה שנשלחים לשרת — רק productId+quantity. לעולם לא מחיר/שם מהקליינט. */
export const cartItemsSchema = z
  .array(
    z.object({
      productId: z.string().trim().min(1),
      quantity: z.number().int().min(1).max(99),
    }),
  )
  .min(1)
  .max(50);
