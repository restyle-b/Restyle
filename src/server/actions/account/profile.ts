"use server";

import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { createProfileSchema } from "@/lib/account/profile-schema";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type UpdateProfileResult = { ok: true } | { ok: false; error: string };

/**
 * עדכון name/phone של המשתמש המחובר בלבד — ownership תמיד לפי session.user.id
 * (אין ולעולם לא יהיה שדה userId שמתקבל מהקליינט כאן). מפתח ה-rate-limit
 * לפי user.id (לא IP) כי זו פעולה שמחייבת session אמיתי ממילא.
 */
export async function updateProfile(input: unknown, locale: string): Promise<UpdateProfileResult> {
  const resolvedLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const t = await getTranslations({ locale: resolvedLocale, namespace: "account.profile.errors" });

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    return { ok: false, error: t("notAuthenticated") };
  }

  if (!rateLimit(`update-profile:${data.user.id}`, 10, 60_000).ok) {
    return { ok: false, error: t("rateLimited") };
  }

  const schema = createProfileSchema({
    nameTooShort: t("nameTooShort"),
    phoneTooShort: t("phoneTooShort"),
  });
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? t("invalidInput") };
  }

  await db.user.update({
    where: { id: data.user.id },
    data: { name: parsed.data.name, phone: parsed.data.phone },
  });

  return { ok: true };
}
