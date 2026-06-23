import type { Metadata } from "next";
import { getServices } from "@/server/actions/admin/services";
import { ServicesForm } from "@/components/admin/services-form";

export const metadata: Metadata = { title: "שירותים | ניהול" };
export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const services = await getServices();

  return (
    <div>
      <h1 className="text-2xl font-semibold">שירותים</h1>
      <p className="mt-1 text-neutral-400">
        שירותי המספרה המוצגים בדף הבית וב-/services. עברית חובה, אנגלית/ערבית אופציונלי.
      </p>
      <div className="mt-6 max-w-3xl">
        <ServicesForm
          initialValues={services.map((s) => ({
            id: s.id,
            slug: s.slug,
            order: s.order,
            nameHe: s.nameHe,
            nameEn: s.nameEn ?? "",
            nameAr: s.nameAr ?? "",
            descriptionHe: s.descriptionHe,
            descriptionEn: s.descriptionEn ?? "",
            descriptionAr: s.descriptionAr ?? "",
            active: s.active,
          }))}
        />
      </div>
    </div>
  );
}
