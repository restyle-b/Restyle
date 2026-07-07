"use server";

import { z } from "zod";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { db } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import type { EnrollmentStatus } from "@prisma/client";

export type EnrollmentView = {
  enrollmentNumber: string;
  courseName: string;
  status: EnrollmentStatus;
  coursePriceAgorot: number;
  amountPaidAgorot: number;
};

export type LookupEnrollmentResult =
  | { ok: true; enrollment: EnrollmentView; guestLookupToken: string }
  | { ok: false; error: string };

/**
 * חיפוש הרשמה לאורח — דורש enrollmentNumber+guestLookupToken יחד (מונע
 * אנומרציה/IDOR). מחזיר גם את ה-token בחזרה כדי שכפתור "תשלום יתרה" יוכל
 * להוכיח בעלות בלי session. שגיאה גנרית זהה לשני מקרי הכישלון.
 */
export async function lookupEnrollment(input: unknown, locale: string): Promise<LookupEnrollmentResult> {
  const resolvedLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const t = await getTranslations({ locale: resolvedLocale, namespace: "academyCommerce.lookup" });

  const ip = await getClientIp();
  if (!rateLimit(`enroll-lookup:${ip}`, 10, 60_000).ok) {
    return { ok: false, error: t("errors.rateLimited") };
  }

  const schema = z.object({
    enrollmentNumber: z.string().trim().min(1, t("errors.numberRequired")).max(20),
    guestLookupToken: z.string().trim().min(1, t("errors.tokenRequired")).max(64),
  });
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? t("notFound") };
  }

  const enrollment = await db.enrollment.findUnique({
    where: { enrollmentNumber: parsed.data.enrollmentNumber },
  });
  if (
    !enrollment ||
    !enrollment.guestLookupToken ||
    enrollment.guestLookupToken !== parsed.data.guestLookupToken
  ) {
    return { ok: false, error: t("notFound") };
  }

  return {
    ok: true,
    guestLookupToken: enrollment.guestLookupToken,
    enrollment: {
      enrollmentNumber: enrollment.enrollmentNumber,
      courseName: enrollment.courseNameHeSnapshot,
      status: enrollment.status,
      coursePriceAgorot: enrollment.coursePriceAgorot,
      amountPaidAgorot: enrollment.amountPaidAgorot,
    },
  };
}
