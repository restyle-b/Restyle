"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/admin/activity-log";
import { contentBlocksSchema } from "@/lib/admin/content-schema";
import { isEditableNamespace } from "@/lib/content/editable-namespaces";
import { CONTENT_BLOCKS_TAG } from "@/lib/content/get-content-overrides";
import { routing } from "@/i18n/routing";

export type AdminActionResult = { ok: true } | { ok: false; error: string };

// כל namespace ערוך ממופה לנתיב הציבורי הבסיסי שלו (בלי prefix locale) —
// לרענון מיידי (revalidatePath) בכל השפות לאחר שמירה.
const NAMESPACE_PATHS: Record<string, string> = {
  home: "/",
  about: "/about",
  accessibility: "/accessibility",
  privacy: "/privacy",
  terms: "/terms",
};

function toNullable(value: string | undefined) {
  return value && value.length > 0 ? value : null;
}

export async function getContentBlocks(namespace: string) {
  await requireAdmin();
  if (!isEditableNamespace(namespace)) {
    throw new Error("namespace לא תקין");
  }
  return db.contentBlock.findMany({ where: { namespace }, orderBy: { key: "asc" } });
}

export async function updateContentBlocks(
  namespace: string,
  input: unknown,
): Promise<AdminActionResult> {
  const admin = await requireAdmin();

  if (!isEditableNamespace(namespace)) {
    return { ok: false, error: "namespace לא תקין" };
  }

  const parsed = contentBlocksSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }

  await db.$transaction(
    parsed.data.map((row) =>
      db.contentBlock.upsert({
        where: { namespace_key: { namespace, key: row.key } },
        create: {
          namespace,
          key: row.key,
          valueHe: row.valueHe,
          valueEn: toNullable(row.valueEn),
          valueAr: toNullable(row.valueAr),
          updatedById: admin.id,
        },
        update: {
          valueHe: row.valueHe,
          valueEn: toNullable(row.valueEn),
          valueAr: toNullable(row.valueAr),
          updatedById: admin.id,
        },
      }),
    ),
  );

  await logActivity({
    actorEmail: admin.email,
    action: "admin.write",
    entityType: "content",
    entityId: namespace,
    summary: `טקסטי אתר עודכנו: ${namespace} (${parsed.data.length} שדות)`,
  });

  revalidateTag(CONTENT_BLOCKS_TAG);
  const basePath = NAMESPACE_PATHS[namespace];
  for (const locale of routing.locales) {
    const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
    revalidatePath(basePath === "/" ? prefix || "/" : `${prefix}${basePath}`);
  }
  revalidatePath("/admin/content/" + namespace);

  return { ok: true };
}
