"use server";

import { randomBytes } from "node:crypto";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { db } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createEnrollSchema } from "@/lib/courses/enrollment-schema";
import { generateEnrollmentNumber } from "@/lib/courses/enrollment-number";
import { getPaymentProvider } from "@/lib/payments/get-provider";
import { siteConfig } from "@/lib/config";

export type CreateEnrollmentResult =
  | { ok: true; enrollmentNumber: string; paymentRedirectUrl: string }
  | { ok: false; error: string };

/** מקדמה מחושבת בשרת בלבד. */
function computeDepositAgorot(priceAgorot: number, depositPercent: number): number {
  return Math.round((priceAgorot * depositPercent) / 100);
}

/**
 * יצירת הרשמה לקורס + פתיחת תשלום (מקדמה או מלא). **נקודת האמת היחידה
 * לחישוב סכום** — הקליינט שולח רק courseId+plan, לעולם לא מחיר.
 */
export async function createEnrollment(
  formInput: unknown,
  locale: string,
): Promise<CreateEnrollmentResult> {
  const resolvedLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const t = await getTranslations({ locale: resolvedLocale, namespace: "academyCommerce.enroll.errors" });

  const ip = await getClientIp();
  if (!rateLimit(`enroll:${ip}`, 5, 60_000).ok) {
    return { ok: false, error: t("rateLimited") };
  }

  const schema = createEnrollSchema({
    nameTooShort: t("nameTooShort"),
    emailInvalid: t("emailInvalid"),
    phoneTooShort: t("phoneTooShort"),
  });
  const parsed = schema.safeParse(formInput);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? t("invalidInput") };
  }
  if (parsed.data.company) {
    return { ok: false, error: t("invalidInput") };
  }

  // קריאה חיה לקורס — לא סומכים על מחיר/מקדמה מהקליינט.
  const course = await db.course.findUnique({ where: { id: parsed.data.courseId } });
  if (!course || !course.active || course.priceAgorot == null) {
    return { ok: false, error: t("courseUnavailable") };
  }

  // בדיקת זמינות מקומות (רכה — race על מקום אחרון מתקבל, כמו stock בחנות).
  if (course.capacity != null) {
    const taken = await db.enrollment.count({
      where: { courseId: course.id, status: { in: ["DEPOSIT_PAID", "PAID"] } },
    });
    if (taken >= course.capacity) {
      return { ok: false, error: t("soldOut") };
    }
  }

  const coursePriceAgorot = course.priceAgorot;
  const depositAgorot = computeDepositAgorot(coursePriceAgorot, course.depositPercent);

  // מסלול מקדמה תקף רק אם המקדמה חיובית וקטנה מהמחיר המלא.
  const depositAvailable = depositAgorot > 0 && depositAgorot < coursePriceAgorot;
  const plan = parsed.data.plan === "DEPOSIT" && depositAvailable ? "DEPOSIT" : "FULL";
  const amountDue = plan === "DEPOSIT" ? depositAgorot : coursePriceAgorot;
  const paymentKind = plan === "DEPOSIT" ? "DEPOSIT" : "FULL";

  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id ?? null;

  const enrollmentNumber = await generateEnrollmentNumber();
  const guestLookupToken = userId ? null : randomBytes(24).toString("base64url");
  const provider = process.env.PAYMENT_PROVIDER === "tranzila" ? "tranzila" : "mock";

  const enrollment = await db.enrollment.create({
    data: {
      enrollmentNumber,
      courseId: course.id,
      courseNameHeSnapshot: course.nameHe,
      userId,
      guestLookupToken,
      customerName: parsed.data.customerName,
      customerEmail: parsed.data.customerEmail,
      customerPhone: parsed.data.customerPhone,
      plan,
      coursePriceAgorot,
      depositAgorot,
      paymentProvider: provider,
      // רשומת פתיחה בהיסטוריית הסטטוס — כל הרשמה נולדת PENDING.
      statusEvents: { create: { toStatus: "PENDING", changedBy: "system" } },
    },
  });

  const coursePayment = await db.coursePayment.create({
    data: { enrollmentId: enrollment.id, kind: paymentKind, provider, amountAgorot: amountDue },
  });

  const localePrefix = resolvedLocale === routing.defaultLocale ? "" : `/${resolvedLocale}`;
  const successUrl = `${siteConfig.url}${localePrefix}/courses/success?enrollment=${enrollmentNumber}`;
  const cancelUrl = `${siteConfig.url}${localePrefix}/courses/cancel?enrollment=${enrollmentNumber}`;

  try {
    const paymentProvider = getPaymentProvider();
    const checkout = await paymentProvider.createCheckout({
      orderId: coursePayment.id, // המזהה שה-handler מחפש לפיו
      orderNumber: enrollmentNumber,
      amountAgorot: amountDue,
      customerEmail: parsed.data.customerEmail,
      customerName: parsed.data.customerName,
      locale: resolvedLocale,
      returnUrls: { success: successUrl, cancel: cancelUrl },
      kind: "enrollment",
    });

    await db.coursePayment.update({
      where: { id: coursePayment.id },
      data: { externalRef: checkout.providerRef },
    });

    return { ok: true, enrollmentNumber, paymentRedirectUrl: checkout.redirectUrl };
  } catch (err) {
    console.error("[courses] createCheckout failed for enrollment", enrollmentNumber, err);
    return { ok: false, error: t("enrollFailed") };
  }
}
