import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContentBlocks } from "@/server/actions/admin/content";
import { isEditableNamespace } from "@/lib/content/editable-namespaces";
import { flattenMessages } from "@/lib/content/flatten-messages";
import { ContentBlocksForm } from "@/components/admin/content-blocks-form";
import type { ContentBlockInput } from "@/lib/admin/content-schema";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ namespace: string }>;
}): Promise<Metadata> {
  const { namespace } = await params;
  return { title: `עריכת תוכן: ${namespace} | ניהול` };
}

export default async function AdminContentNamespacePage({
  params,
}: {
  params: Promise<{ namespace: string }>;
}) {
  const { namespace } = await params;
  if (!isEditableNamespace(namespace)) {
    notFound();
  }

  const rows = await getContentBlocks(namespace);

  let initialValues: ContentBlockInput[];
  if (rows.length > 0) {
    initialValues = rows.map((r) => ({
      key: r.key,
      valueHe: r.valueHe,
      valueEn: r.valueEn ?? "",
      valueAr: r.valueAr ?? "",
    }));
  } else {
    // טרם הורצה המיגרציה הידנית (ראה prisma/migrations/20260623000000_admin_content_cms)
    // או שאין שורות עדיין — בונה רשימת שדות ברירת מחדל מתוך messages/*.json הסטטי,
    // כדי שהמנהל יוכל לערוך ולשמור גם בלי seed מוקדם.
    const [he, en, ar] = await Promise.all([
      import(`../../../../../messages/he.json`),
      import(`../../../../../messages/en.json`),
      import(`../../../../../messages/ar.json`),
    ]);
    const heFlat = flattenMessages(he.default[namespace] ?? {});
    const enFlat = flattenMessages(en.default[namespace] ?? {});
    const arFlat = flattenMessages(ar.default[namespace] ?? {});
    initialValues = Object.entries(heFlat).map(([key, valueHe]) => ({
      key,
      valueHe,
      valueEn: enFlat[key] ?? "",
      valueAr: arFlat[key] ?? "",
    }));
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">עריכת תוכן: {namespace}</h1>
      <p className="mt-1 text-neutral-400">
        כל שדה כאן מתאים לפסקה/טקסט בעמוד הציבורי. עברית חובה, אנגלית/ערבית אופציונלי (נופל
        לעברית אם ריק).
      </p>
      <div className="mt-6 max-w-3xl">
        <ContentBlocksForm namespace={namespace} initialValues={initialValues} />
      </div>
    </div>
  );
}
