"use server";

import { z } from "zod";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { db } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ToggleWishlistResult = { ok: true; wishlisted: boolean } | { ok: false; error: string };

const productIdSchema = z.string().trim().min(1).max(100);

function isUniqueConstraintError(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && (err as { code?: string }).code === "P2002";
}

/**
 * הוספה/הסרה של מוצר למועדפים של המשתמש המחובר — טוגל אמיתי בצד השרת
 * (בודקים מצב קיים ב-DB, לא סומכים על "מה שהקליינט חושב שהמצב הוא"). יצירה
 * כפולה (מרוץ בין שני קליקים/טאבים) נתפסת ע"י ה-unique constraint (P2002)
 * ומטופלת כהצלחה אידמפוטנטית — לא שגיאה. בעלות: תמיד לפי session.user.id,
 * ה-productId מהקליינט הוא הפרמטר היחיד שאינו "מי אני" (ownership אינהרנטי,
 * אין שדה userId שמגיע מהקליינט בכלל).
 */
export async function toggleWishlistItem(productIdInput: unknown, locale: string): Promise<ToggleWishlistResult> {
  const resolvedLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const t = await getTranslations({ locale: resolvedLocale, namespace: "account.wishlist.errors" });

  const parsed = productIdSchema.safeParse(productIdInput);
  if (!parsed.success) {
    return { ok: false, error: t("invalidInput") };
  }
  const productId = parsed.data;

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    return { ok: false, error: t("notAuthenticated") };
  }
  const userId = data.user.id;

  const ip = await getClientIp();
  if (!rateLimit(`wishlist-toggle:${userId}:${ip}`, 30, 60_000).ok) {
    return { ok: false, error: t("rateLimited") };
  }

  const existing = await db.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
    select: { id: true },
  });

  if (existing) {
    await db.wishlistItem.delete({ where: { id: existing.id } });
    return { ok: true, wishlisted: false };
  }

  try {
    await db.wishlistItem.create({ data: { userId, productId } });
    return { ok: true, wishlisted: true };
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      // מרוץ: נוצר כבר ע"י בקשה מקבילה — התוצאה הסופית זהה (קיים במועדפים).
      return { ok: true, wishlisted: true };
    }
    console.error("[wishlist] toggle failed:", err);
    return { ok: false, error: t("invalidInput") };
  }
}
