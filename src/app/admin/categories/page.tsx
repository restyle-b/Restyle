import type { Metadata } from "next";
import { getCategories } from "@/server/actions/admin/categories";
import { CategoriesForm } from "@/components/admin/categories-form";

export const metadata: Metadata = { title: "קטגוריות | ניהול" };
export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div>
      <h1 className="text-2xl font-semibold">קטגוריות</h1>
      <p className="mt-1 text-neutral-400">קטגוריות מוצרי החנות. עברית חובה, אנגלית/ערבית אופציונלי.</p>
      <div className="mt-6 max-w-3xl">
        <CategoriesForm
          initialValues={categories.map((c) => ({
            id: c.id,
            order: c.order,
            nameHe: c.nameHe,
            nameEn: c.nameEn ?? "",
            nameAr: c.nameAr ?? "",
            active: c.active,
          }))}
        />
      </div>
    </div>
  );
}
