"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { db } from "@/lib/db";
import { siteSettingsSchema, openingHoursSchema } from "@/lib/admin/site-settings-schema";

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
      updatedById: admin.id,
    },
  });

  revalidatePath("/admin/settings");
  return { ok: true };
}

export async function getOpeningHours() {
  await requireAdmin();
  return db.openingHour.findMany({ orderBy: { dayOrder: "asc" } });
}

export async function updateOpeningHours(input: unknown): Promise<AdminActionResult> {
  await requireAdmin();

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
          dayHe: row.dayHe,
          dayEn: toNullable(row.dayEn),
          dayAr: toNullable(row.dayAr),
          hoursHe: row.hoursHe,
          hoursEn: toNullable(row.hoursEn),
          hoursAr: toNullable(row.hoursAr),
        },
        update: {
          dayHe: row.dayHe,
          dayEn: toNullable(row.dayEn),
          dayAr: toNullable(row.dayAr),
          hoursHe: row.hoursHe,
          hoursEn: toNullable(row.hoursEn),
          hoursAr: toNullable(row.hoursAr),
        },
      }),
    ),
  );

  revalidatePath("/admin/settings");
  return { ok: true };
}
