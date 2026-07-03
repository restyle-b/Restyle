import type { Metadata } from "next";
import { getProducts, getCategoriesForSelect } from "@/server/actions/admin/products";
import { ProductsTable } from "@/components/admin/products/products-table";

export const metadata: Metadata = { title: "מוצרים | ניהול" };
export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategoriesForSelect()]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">מוצרים ומלאי</h1>
      <p className="mt-1 text-sm text-neutral-400">
        עריכה ישירה מהרשימה — מחיר, מחיר מבצע, מלאי, זמינות, נראות והבלטה נשמרים מיד, בלי לפתוח דף נפרד.
      </p>
      <div className="mt-6">
        <ProductsTable products={products} categories={categories} />
      </div>
    </div>
  );
}
