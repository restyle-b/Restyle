"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { db } from "@/lib/db";
import { testimonialSchema, type TestimonialInput } from "@/lib/admin/testimonials-schema";
import { TESTIMONIALS_TAG } from "@/lib/content/get-testimonials";
import { routing } from "@/i18n/routing";

export type AdminActionResult = { ok: true } | { ok: false; error: string };

function toNullable(value: string | undefined) {
  return value && value.length > 0 ? value : null;
}

function revalidatePublicPaths() {
  revalidateTag(TESTIMONIALS_TAG);
  for (const locale of routing.locales) {
    const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
    revalidatePath(prefix || "/");
  }
  revalidatePath("/admin/testimonials");
}

export async function getTestimonials() {
  await requireAdmin();
  return db.testimonial.findMany({ orderBy: { order: "asc" } });
}

export async function updateTestimonials(input: unknown): Promise<AdminActionResult> {
  await requireAdmin();

  const parsed = testimonialSchema.array().max(100).safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }

  const rows: TestimonialInput[] = parsed.data;
  const existingIds = rows.map((r) => r.id).filter((id): id is string => Boolean(id));

  await db.$transaction(async (tx) => {
    await tx.testimonial.deleteMany({ where: { id: { notIn: existingIds } } });
    for (const row of rows) {
      const data = {
        order: row.order,
        nameHe: row.nameHe,
        nameEn: toNullable(row.nameEn),
        nameAr: toNullable(row.nameAr),
        quoteHe: row.quoteHe,
        quoteEn: toNullable(row.quoteEn),
        quoteAr: toNullable(row.quoteAr),
        active: row.active,
      };
      if (row.id) {
        await tx.testimonial.update({ where: { id: row.id }, data });
      } else {
        await tx.testimonial.create({ data });
      }
    }
  });

  revalidatePublicPaths();
  return { ok: true };
}
