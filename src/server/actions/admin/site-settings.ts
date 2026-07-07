"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/admin/activity-log";
import {
  siteSettingsSchema,
  openingHoursSchema,
  shippingFeeShekelsToAgorot,
} from "@/lib/admin/site-settings-schema";
import { OPENING_HOURS_TAG } from "@/lib/content/get-opening-hours";
import { SITE_SETTINGS_TAG } from "@/lib/content/get-site-settings";
import { routing } from "@/i18n/routing";

function revalidateOpeningHoursPaths() {
  revalidateTag(OPENING_HOURS_TAG);
  for (const locale of routing.locales) {
    const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
    revalidatePath(prefix || "/");
    revalidatePath(`${prefix}/locations`);
  }
}

function revalidateSiteSettingsPaths() {
  revalidateTag(SITE_SETTINGS_TAG);
  for (const locale of routing.locales) {
    const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
    // "layout" מרענן גם את ה-layout המשותף (header/footer/floating-contact)
    // לכל הדפים תחתיו, לא רק את דף הבית עצמו.
    revalidatePath(prefix || "/", "layout");
    for (const path of ["/contact", "/locations", "/privacy", "/terms", "/gallery"]) {
      revalidatePath(`${prefix}${path}`);
    }
  }
}

export type AdminActionResult = { ok: true } | { ok: false; error: string };

function toNullable(value: string | undefined) {
  return value && value.length > 0 ? value : null;
}

export async function getSiteSettings() {
  await requireAdmin();
  return db.siteSettings.findUnique({ where: { id: 1 } });
}

export async function updateSiteSettings(input: unknown): Promise<AdminActionResult> {
  const admin = await requireAdmin();

  const parsed = siteSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }

  const data = parsed.data;
  // שני השדות אופציונליים ב-input (ראה site-settings-schema.ts) — כשהם חסרים
  // (למשל טופס פרטי הקשר, שלא נוגע בהם) משאירים undefined כדי ש-Prisma ידלג
  // על העמודה (upsert/update) ולא יאפס אותה לברירת המחדל של הסכימה.
  const shippingFeeAgorot =
    data.shippingFeeShekels !== undefined
      ? shippingFeeShekelsToAgorot(data.shippingFeeShekels)
      : undefined;
  const lowStockThreshold =
    data.lowStockThreshold !== undefined ? Number(data.lowStockThreshold) : undefined;

  await db.siteSettings.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      phone: data.phone,
      email: data.email,
      address: data.address,
      whatsapp: data.whatsapp,
      instagramUrl: toNullable(data.instagramUrl),
      facebookUrl: toNullable(data.facebookUrl),
      appStoreUrl: toNullable(data.appStoreUrl),
      googlePlayUrl: toNullable(data.googlePlayUrl),
      shippingFeeAgorot,
      lowStockThreshold,
      updatedById: admin.id,
    },
    update: {
      phone: data.phone,
      email: data.email,
      address: data.address,
      whatsapp: data.whatsapp,
      instagramUrl: toNullable(data.instagramUrl),
      facebookUrl: toNullable(data.facebookUrl),
      appStoreUrl: toNullable(data.appStoreUrl),
      googlePlayUrl: toNullable(data.googlePlayUrl),
      shippingFeeAgorot,
      lowStockThreshold,
      updatedById: admin.id,
    },
  });

  await logActivity({
    actorEmail: admin.email,
    action: "admin.write",
    entityType: "settings",
    summary: "הגדרות אתר עודכנו",
  });

  revalidateSiteSettingsPaths();
  revalidatePath("/admin/settings");
  return { ok: true };
}

export async function getOpeningHoursAdmin() {
  await requireAdmin();
  return db.openingHour.findMany({ orderBy: { dayOrder: "asc" } });
}

export async function updateOpeningHours(input: unknown): Promise<AdminActionResult> {
  const admin = await requireAdmin();

  const parsed = openingHoursSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }

  const rows = parsed.data;
  const dayOrders = rows.map((r) => r.dayOrder);
  if (new Set(dayOrders).size !== dayOrders.length) {
    return { ok: false, error: "כל יום יכול להופיע פעם אחת בלבד" };
  }

  await db.$transaction(
    rows.map((row) =>
      db.openingHour.upsert({
        where: { dayOrder: row.dayOrder },
        create: {
          dayOrder: row.dayOrder,
          closed: row.closed,
          openTime: row.closed ? null : toNullable(row.openTime),
          closeTime: row.closed ? null : toNullable(row.closeTime),
        },
        update: {
          closed: row.closed,
          openTime: row.closed ? null : toNullable(row.openTime),
          closeTime: row.closed ? null : toNullable(row.closeTime),
        },
      }),
    ),
  );

  await logActivity({
    actorEmail: admin.email,
    action: "admin.write",
    entityType: "settings",
    summary: "שעות פתיחה עודכנו",
  });

  revalidateOpeningHoursPaths();
  revalidatePath("/admin/settings");
  return { ok: true };
}
