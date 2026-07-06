import type { Metadata } from "next";
import { getProducts, getCategoriesForSelect } from "@/server/actions/admin/products";
import { getLowStockThreshold } from "@/lib/admin/low-stock";
import { ProductsTable } from "@/components/admin/products/products-table";

export const metadata: Metadata = { title: "מוצרים | ניהול" };
export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  // page.tsx יושב תחת admin/layout.tsx (requireAdmin ברמת ה-layout); getProducts/
  // getCategoriesForSelect עדיין בודקים הרשאה בעצמם (defense in depth, אותה
  // קונבנציה כמו שאר האדמין). getLowStockThreshold היא helper פנימי בלבד
  // (לא server action חשוף), נקראת ישירות מה-server component.
  const [products, categories, lowStockThreshold] = await Promise.all([
    getProducts(),
    getCategoriesForSelect(),
    getLowStockThreshold(),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">מוצרים ומלאי</h1>
      <p className="mt-1 text-sm text-neutral-400">
        עריכה ישירה מהרשימה — מחיר, מחיר מבצע, מלאי, זמינות, נראות והבלטה נשמרים מיד, בלי לפתוח דף נפרד.
      </p>
      <div className="mt-6">
        <ProductsTable products={products} categories={categories} lowStockThreshold={lowStockThreshold} />
      </div>
    </div>
  );
}
