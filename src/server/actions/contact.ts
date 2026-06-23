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

  // rate limiting לפי IP — מניעת ספאם/הפצצת מיילים (בקשה אחת לדקה)
  const ip = await getClientIp();
  if (!rateLimit(`contact:${ip}`, 1, 60_000).ok) {
    return { ok: false, error: t("rateLimited") };
  }

  const { email, phone, message } = parsed.data;
  // הגנת עומק: שולל תווי CR/LF משם המשתמש לפני הטמעה ב-subject, כדי לחסום
  // email header injection אם ספק ה-API (Resend) לא יסנן זאת בעצמו.
  const name = parsed.data.name.replace(/[\r\n]/g, " ");

  // Brevo לא הוקם עדיין (ראה ROADMAP). לא רושמים PII ללוג הפרודקשן —
  // פרטי ההודעה נחשפים בלוג רק בפיתוח, לצורך דיבוג מקומי.
  if (!process.env.BREVO_API_KEY) {
    if (process.env.NODE_ENV === "development") {
      console.info("[contact] (dev) התקבלה הודעת צור קשר:", { name, email, phone, message });
    } else {
      console.info("[contact] התקבלה הודעת צור קשר אך Brevo לא מוגדר — ההודעה לא נשלחה");
    }
    return { ok: true };
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: "ReStyle Website",
        email: process.env.BREVO_SENDER_EMAIL ?? "noreply@restyle.co.il",
      },
      to: [{ email: process.env.CONTACT_NOTIFICATION_EMAIL ?? "Restyle.Barbershop@outlook.com" }],
      replyTo: { email },
      subject: `הודעה חדשה מאתר ReStyle — ${name}`,
      textContent: `שם: ${name}\nאימייל: ${email}\nטלפון: ${phone || "-"}\n\n${message}`,
    }),
  });

  if (!response.ok) {
    console.error("[contact] שליחת מייל דרך Brevo נכשלה", response.status);
    return { ok: false, error: t("sendFailed") };
  }

  return { ok: true };
}
