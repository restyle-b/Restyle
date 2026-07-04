"use server";

import { z } from "zod";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Prisma } from "@prisma/client";
import { routing } from "@/i18n/routing";
import { createAddressSchema } from "@/lib/account/address-schema";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AddressActionResult = { ok: true } | { ok: false; error: string };

const addressIdSchema = z.string().trim().min(1).max(100);

async function requireUserId(
  locale: string,
): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  const resolvedLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const t = await getTranslations({ locale: resolvedLocale, namespace: "account.addresses.errors" });

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    return { ok: false, error: t("notAuthenticated") };
  }
  return { ok: true, userId: data.user.id };
}

/**
 * הופך כתובת לברירת מחדל בתוך טרנזקציה — קודם מבטלים את ברירת המחדל
 * הנוכחית (אם יש), רק אז מסמנים את החדשה. חובה בטרנזקציה בגלל האינדקס
 * הייחודי החלקי user_addresses_one_default_per_user (userId) WHERE
 * isDefault=true (ראה prisma/migrations/20260704000000_.../migration.sql) —
 * כתיבה לא-אטומית של "קודם לבטל, אחר-כך לקבוע" עלולה להיתקל ב-race עם
 * בקשה מקבילה ולהפר את האינדקס (שתי כתובות true בו-זמנית).
 */
async function setAsDefaultInTx(tx: Prisma.TransactionClient, userId: string, addressId: string) {
  await tx.userAddress.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
  await tx.userAddress.update({ where: { id: addressId }, data: { isDefault: true } });
}

export async function createAddress(input: unknown, locale: string): Promise<AddressActionResult> {
  const resolvedLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const t = await getTranslations({ locale: resolvedLocale, namespace: "account.addresses.errors" });

  const auth = await requireUserId(locale);
  if (!auth.ok) return auth;
  const { userId } = auth;

  if (!rateLimit(`address-write:${userId}`, 20, 60_000).ok) {
    return { ok: false, error: t("rateLimited") };
  }

  const schema = createAddressSchema({
    labelRequired: t("labelRequired"),
    lineRequired: t("lineRequired"),
    cityRequired: t("cityRequired"),
  });
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? t("invalidInput") };
  }

  const existingCount = await db.userAddress.count({ where: { userId } });
  // כתובת ראשונה של המשתמש הופכת לברירת מחדל אוטומטית — אחרת אין ברירת
  // מחדל בכלל למרות שיש כתובת שמורה אחת, מצב מבלבל בצ'קאאוט.
  const shouldBeDefault = parsed.data.isDefault || existingCount === 0;

  await db.$transaction(async (tx) => {
    if (shouldBeDefault) {
      await tx.userAddress.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
    }
    await tx.userAddress.create({
      data: {
        userId,
        label: parsed.data.label,
        line: parsed.data.line,
        city: parsed.data.city,
        notes: parsed.data.notes || null,
        isDefault: shouldBeDefault,
      },
    });
  });

  return { ok: true };
}

export async function updateAddress(
  addressIdInput: unknown,
  input: unknown,
  locale: string,
): Promise<AddressActionResult> {
  const resolvedLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const t = await getTranslations({ locale: resolvedLocale, namespace: "account.addresses.errors" });

  const auth = await requireUserId(locale);
  if (!auth.ok) return auth;
  const { userId } = auth;

  if (!rateLimit(`address-write:${userId}`, 20, 60_000).ok) {
    return { ok: false, error: t("rateLimited") };
  }

  const parsedId = addressIdSchema.safeParse(addressIdInput);
  if (!parsedId.success) {
    return { ok: false, error: t("invalidInput") };
  }

  // בדיקת ownership עצמאית — IDOR guard, אותו דפוס כמו הזמנה/הרשמה (לא
  // סומכים על כך שה-id הגיע מרשימת הכתובות של המשתמש בעצמו).
  const existing = await db.userAddress.findUnique({ where: { id: parsedId.data } });
  if (!existing || existing.userId !== userId) {
    return { ok: false, error: t("notFound") };
  }

  const schema = createAddressSchema({
    labelRequired: t("labelRequired"),
    lineRequired: t("lineRequired"),
    cityRequired: t("cityRequired"),
  });
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? t("invalidInput") };
  }

  // אי-אפשר "לבטל" ברירת מחדל דרך הטופס בלי לבחור כתובת אחרת במקומה —
  // מונע מצב של אפס כתובות-ברירת-מחדל בזמן שיש כתובות שמורות.
  const shouldBeDefault = parsed.data.isDefault || existing.isDefault;

  await db.$transaction(async (tx) => {
    if (shouldBeDefault && !existing.isDefault) {
      await tx.userAddress.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
    }
    await tx.userAddress.update({
      where: { id: parsedId.data },
      data: {
        label: parsed.data.label,
        line: parsed.data.line,
        city: parsed.data.city,
        notes: parsed.data.notes || null,
        isDefault: shouldBeDefault,
      },
    });
  });

  return { ok: true };
}

export async function setDefaultAddress(addressIdInput: unknown, locale: string): Promise<AddressActionResult> {
  const resolvedLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const t = await getTranslations({ locale: resolvedLocale, namespace: "account.addresses.errors" });

  const auth = await requireUserId(locale);
  if (!auth.ok) return auth;
  const { userId } = auth;

  const parsedId = addressIdSchema.safeParse(addressIdInput);
  if (!parsedId.success) {
    return { ok: false, error: t("invalidInput") };
  }

  const existing = await db.userAddress.findUnique({ where: { id: parsedId.data } });
  if (!existing || existing.userId !== userId) {
    return { ok: false, error: t("notFound") };
  }

  if (!existing.isDefault) {
    await db.$transaction((tx) => setAsDefaultInTx(tx, userId, parsedId.data));
  }

  return { ok: true };
}

export async function deleteAddress(addressIdInput: unknown, locale: string): Promise<AddressActionResult> {
  const resolvedLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const t = await getTranslations({ locale: resolvedLocale, namespace: "account.addresses.errors" });

  const auth = await requireUserId(locale);
  if (!auth.ok) return auth;
  const { userId } = auth;

  const parsedId = addressIdSchema.safeParse(addressIdInput);
  if (!parsedId.success) {
    return { ok: false, error: t("invalidInput") };
  }

  const existing = await db.userAddress.findUnique({ where: { id: parsedId.data } });
  if (!existing || existing.userId !== userId) {
    return { ok: false, error: t("notFound") };
  }

  await db.$transaction(async (tx) => {
    await tx.userAddress.delete({ where: { id: parsedId.data } });
    if (existing.isDefault) {
      // הכתובת שנמחקה הייתה ברירת המחדל — מקדמים את הכתובת הכי חדשה
      // שנותרה, כדי לא להשאיר משתמש עם כתובות שמורות אך בלי ברירת מחדל.
      const nextDefault = await tx.userAddress.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      if (nextDefault) {
        await tx.userAddress.update({ where: { id: nextDefault.id }, data: { isDefault: true } });
      }
    }
  });

  return { ok: true };
}
