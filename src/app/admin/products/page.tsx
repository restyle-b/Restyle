import type { Metadata } from "next";
import { getProducts, getCategoriesForSelect } from "@/server/actions/admin/products";
import { ProductsForm } from "@/components/admin/products-form";

export const metadata: Metadata = { title: "מוצרים | ניהול" };
export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategoriesForSelect()]);

  return (
    <div>
      <h1 className="text-2xl font-semibold">מוצרים</h1>
      <p className="mt-1 text-neutral-400">
        מוצרי החנות. מחיר מוזן בשקלים ומומר אוטומטית לאגורות בשמירה.
      </p>
      <div className="mt-6 max-w-3xl">
        <ProductsForm
          categories={categories}
          initialValues={products.map((p) => ({
            id: p.id,
            slug: p.slug,
            order: p.order,
            nameHe: p.nameHe,
            nameEn: p.nameEn ?? "",
            nameAr: p.nameAr ?? "",
            descriptionHe: p.descriptionHe,
            descriptionEn: p.descriptionEn ?? "",
            descriptionAr: p.descriptionAr ?? "",
            priceShekels: (p.priceAgorot / 100).toString(),
            stock: p.stock,
            imageUrl: p.imageUrl ?? "",
            categoryId: p.categoryId ?? "",
            active: p.active,
          }))}
        />
      </div>
    </div>
  );
}
