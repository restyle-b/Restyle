"use server";

import { getTranslations } from "next-intl/server";
import { createContactSchema } from "@/lib/contact-schema";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export type ContactActionResult = { ok: true } | { ok: false; error: string };

export async function submitContactForm(
  input: unknown,
  locale: string,
): Promise<ContactActionResult> {
  const resolvedLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const t = await getTranslations({ locale: resolvedLocale, namespace: "contactForm.errors" });
  const contactSchema = createContactSchema({
    nameTooShort: t("nameTooShort"),
    emailInvalid: t("emailInvalid"),
    messageTooShort: t("messageTooShort"),
  });

  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? t("invalidInput") };
  }

  // honeypot מלא => התעלמות שקטה, מציגים הצלחה כדי לא לחשוף את המנגנון לבוטים
  if (parsed.data.company) {
    return { ok: true };
  }

  // rate limiting לפי IP — מניעת ספאם/הפצצת מיילים (5 בקשות לדקה)
  const ip = await getClientIp();
  if (!rateLimit(`contact:${ip}`, 5, 60_000).ok) {
    return { ok: false, error: t("rateLimited") };
  }

  const { name, email, phone, message } = parsed.data;

  // Resend לא הוקם עדיין (ראה ROADMAP). לא רושמים PII ללוג הפרודקשן —
  // פרטי ההודעה נחשפים בלוג רק בפיתוח, לצורך דיבוג מקומי.
  if (!process.env.RESEND_API_KEY) {
    if (process.env.NODE_ENV === "development") {
      console.info("[contact] (dev) התקבלה הודעת צור קשר:", { name, email, phone, message });
    } else {
      console.info("[contact] התקבלה הודעת צור קשר אך Resend לא מוגדר — ההודעה לא נשלחה");
    }
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
    return { ok: false, error: t("sendFailed") };
  }

  return { ok: true };
}
