import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { EDITABLE_NAMESPACES } from "@/lib/content/editable-namespaces";

export const metadata: Metadata = { title: "טקסטי האתר | ניהול" };
export const dynamic = "force-dynamic";

const NAMESPACE_LABELS: Record<string, string> = {
  home: "דף הבית",
  about: "אודות",
  accessibility: "הצהרת נגישות",
  privacy: "מדיניות פרטיות",
  terms: "תנאי שימוש",
};

export default async function AdminContentIndexPage() {
  await requireAdmin();

  return (
    <div>
      <h1 className="text-2xl font-semibold">טקסטי האתר</h1>
      <p className="mt-1 text-neutral-400">
        עריכת כל פסקה/שדה טקסט בעמודי השיווק והמשפטיים. עברית חובה, אנגלית/ערבית אופציונלי.
      </p>
      <ul className="mt-6 max-w-md space-y-2">
        {EDITABLE_NAMESPACES.map((ns) => (
          <li key={ns}>
            <Link
              href={`/admin/content/${ns}`}
              className="block rounded-md border border-line-dark px-4 py-3 hover:border-accent"
            >
              {NAMESPACE_LABELS[ns] ?? ns}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
