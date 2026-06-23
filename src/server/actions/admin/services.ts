"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { db } from "@/lib/db";
import { serviceSchema, type ServiceInput } from "@/lib/admin/services-schema";
import { SERVICES_TAG } from "@/lib/content/get-services";
import { routing } from "@/i18n/routing";

export type AdminActionResult = { ok: true } | { ok: false; error: string };

function toNullable(value: string | undefined) {
  return value && value.length > 0 ? value : null;
}

function revalidatePublicPaths() {
  revalidateTag(SERVICES_TAG);
  for (const locale of routing.locales) {
    const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
    revalidatePath(prefix || "/");
    revalidatePath(`${prefix}/services`);
  }
  revalidatePath("/admin/services");
}

export async function getServices() {
  await requireAdmin();
  return db.service.findMany({ orderBy: { order: "asc" } });
}

export async function updateServices(input: unknown): Promise<AdminActionResult> {
  await requireAdmin();

  const parsed = serviceSchema.array().max(100).safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }

  const rows: ServiceInput[] = parsed.data;
  const slugs = rows.map((r) => r.slug);
  if (new Set(slugs).size !== slugs.length) {
    return { ok: false, error: "כל slug חייב להיות ייחודי" };
  }

  await db.$transaction(async (tx) => {
    await tx.service.deleteMany({ where: { slug: { notIn: slugs } } });
    for (const row of rows) {
      await tx.service.upsert({
        where: { slug: row.slug },
        create: {
          slug: row.slug,
          order: row.order,
          nameHe: row.nameHe,
          nameEn: toNullable(row.nameEn),
          nameAr: toNullable(row.nameAr),
          descriptionHe: row.descriptionHe,
          descriptionEn: toNullable(row.descriptionEn),
          descriptionAr: toNullable(row.descriptionAr),
          active: row.active,
        },
        update: {
          order: row.order,
          nameHe: row.nameHe,
          nameEn: toNullable(row.nameEn),
          nameAr: toNullable(row.nameAr),
          descriptionHe: row.descriptionHe,
          descriptionEn: toNullable(row.descriptionEn),
          descriptionAr: toNullable(row.descriptionAr),
          active: row.active,
        },
      });
    }
  });

  revalidatePublicPaths();
  return { ok: true };
}
