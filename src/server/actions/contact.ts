"use server";

import { contactSchema } from "@/lib/contact-schema";

export type ContactActionResult = { ok: true } | { ok: false; error: string };

export async function submitContactForm(input: unknown): Promise<ContactActionResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }

  // honeypot מלא => התעלמות שקטה, מציגים הצלחה כדי לא לחשוף את המנגנון לבוטים
  if (parsed.data.company) {
    return { ok: true };
  }

  const { name, email, phone, message } = parsed.data;

  // Resend לא הוקם עדיין (ראה ROADMAP) — רושמים בלוג השרת עד לחיבור בפועל.
  if (!process.env.RESEND_API_KEY) {
    console.info("[contact] התקבלה הודעת צור קשר (Resend לא מוגדר):", {
      name,
      email,
      phone,
      message,
    });
    return { ok: true };
  }

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: "ReStyle Website <onboarding@resend.dev>",
    to: process.env.CONTACT_NOTIFICATION_EMAIL ?? "Restyle.Barbershop@outlook.com",
    replyTo: email,
    subject: `הודעה חדשה מאתר ReStyle — ${name}`,
    text: `שם: ${name}\nאימייל: ${email}\nטלפון: ${phone || "-"}\n\n${message}`,
  });

  if (error) {
    return { ok: false, error: "שליחת ההודעה נכשלה, נסו שוב מאוחר יותר" };
  }

  return { ok: true };
}
