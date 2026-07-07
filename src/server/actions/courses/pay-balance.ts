"use server";

import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { db } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPaymentProvider } from "@/lib/payments/get-provider";
import { siteConfig } from "@/lib/config";

export type PayBalanceResult =
  | { ok: true; paymentRedirectUrl: string }
  | { ok: false; error: string };

/**
 * פתיחת תשלום יתרה להרשמה בסטטוס DEPOSIT_PAID. בדיקת בעלות: משתמש מחובר
 * שההרשמה שלו, **או** אורח עם guestLookupToken תואם. הסכום (יתרה) מחושב
 * בשרת בלבד. מקביל ל-create-enrollment אך kind=BALANCE.
 */
export async function payBalance(
  input: { enrollmentNumber: string; guestLookupToken?: string },
  locale: string,
): Promise<PayBalanceResult> {
  const resolvedLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const t = await getTranslations({ locale: resolvedLocale, namespace: "academyCommerce.enroll.errors" });

  const ip = await getClientIp();
  if (!rateLimit(`pay-balance:${ip}`, 10, 60_000).ok) {
    return { ok: false, error: t("rateLimited") };
  }

  const enrollmentNumber = String(input.enrollmentNumber ?? "").trim();
  if (!enrollmentNumber) {
    return { ok: false, error: t("invalidInput") };
  }

  const enrollment = await db.enrollment.findUnique({ where: { enrollmentNumber } });
  if (!enrollment) {
    return { ok: false, error: t("courseUnavailable") };
  }

  // בדיקת בעלות — session user או guestLookupToken (לא סומכים על מספר בלבד).
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id ?? null;
  const ownedByUser = userId != null && enrollment.userId === userId;
  const ownedByToken =
    !!input.guestLookupToken &&
    !!enrollment.guestLookupToken &&
    enrollment.guestLookupToken === input.guestLookupToken;
  if (!ownedByUser && !ownedByToken) {
    return { ok: false, error: t("courseUnavailable") };
  }

  if (enrollment.status !== "DEPOSIT_PAID") {
    return { ok: false, error: t("invalidInput") };
  }

  const balanceAgorot = enrollment.coursePriceAgorot - enrollment.amountPaidAgorot;
  if (balanceAgorot <= 0) {
    return { ok: false, error: t("invalidInput") };
  }

  // מניעת חיוב-כפול: אם כבר יש תשלום PENDING על ההרשמה (יתרה שכבר נפתחה),
  // לא פותחים עוד אחד. מונע race של הפעלת "תשלום יתרה" פעמיים.
  const pendingExists = await db.coursePayment.findFirst({
    where: { enrollmentId: enrollment.id, status: "PENDING" },
    select: { id: true },
  });
  if (pendingExists) {
    return { ok: false, error: t("invalidInput") };
  }

  const provider = process.env.PAYMENT_PROVIDER === "tranzila" ? "tranzila" : "mock";
  const coursePayment = await db.coursePayment.create({
    data: { enrollmentId: enrollment.id, kind: "BALANCE", provider, amountAgorot: balanceAgorot },
  });

  const localePrefix = resolvedLocale === routing.defaultLocale ? "" : `/${resolvedLocale}`;
  const successUrl = `${siteConfig.url}${localePrefix}/courses/success?enrollment=${enrollmentNumber}`;
  const cancelUrl = `${siteConfig.url}${localePrefix}/courses/cancel?enrollment=${enrollmentNumber}`;

  try {
    const paymentProvider = getPaymentProvider();
    const checkout = await paymentProvider.createCheckout({
      orderId: coursePayment.id,
      orderNumber: enrollmentNumber,
      amountAgorot: balanceAgorot,
      customerEmail: enrollment.customerEmail,
      customerName: enrollment.customerName,
      locale: resolvedLocale,
      returnUrls: { success: successUrl, cancel: cancelUrl },
      kind: "enrollment",
    });

    await db.coursePayment.update({
      where: { id: coursePayment.id },
      data: { externalRef: checkout.providerRef },
    });

    return { ok: true, paymentRedirectUrl: checkout.redirectUrl };
  } catch (err) {
    console.error("[courses] payBalance createCheckout failed", enrollmentNumber, err);
    // ניקוי — אחרת ה-PENDING שנוצר יחסום ניסיונות עתידיים (הגארד למעלה).
    await db.coursePayment.delete({ where: { id: coursePayment.id } }).catch(() => {});
    return { ok: false, error: t("enrollFailed") };
  }
}

