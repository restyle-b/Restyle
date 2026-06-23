"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { db } from "@/lib/db";
import { galleryImageSchema, type GalleryImageInput } from "@/lib/admin/gallery-schema";
import { GALLERY_TAG } from "@/lib/content/get-gallery";
import { routing } from "@/i18n/routing";

export type AdminActionResult = { ok: true } | { ok: false; error: string };

function toNullable(value: string | undefined) {
  return value && value.length > 0 ? value : null;
}

function revalidatePublicPaths() {
  revalidateTag(GALLERY_TAG);
  for (const locale of routing.locales) {
    const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
    revalidatePath(prefix || "/");
    revalidatePath(`${prefix}/gallery`);
  }
  revalidatePath("/admin/gallery");
}

export async function getGalleryImages() {
  await requireAdmin();
  return db.galleryImage.findMany({ orderBy: { order: "asc" } });
}

export async function updateGalleryImages(input: unknown): Promise<AdminActionResult> {
  await requireAdmin();

  const parsed = galleryImageSchema.array().max(200).safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }

  const rows: GalleryImageInput[] = parsed.data;
  const existingIds = rows.map((r) => r.id).filter((id): id is string => Boolean(id));

  await db.$transaction(async (tx) => {
    await tx.galleryImage.deleteMany({ where: { id: { notIn: existingIds } } });
    for (const row of rows) {
      const data = {
        order: row.order,
        imageUrl: row.imageUrl,
        altHe: row.altHe,
        altEn: toNullable(row.altEn),
        altAr: toNullable(row.altAr),
        active: row.active,
      };
      if (row.id) {
        await tx.galleryImage.update({ where: { id: row.id }, data });
      } else {
        await tx.galleryImage.create({ data });
      }
    }
  });

  revalidatePublicPaths();
  return { ok: true };
}
