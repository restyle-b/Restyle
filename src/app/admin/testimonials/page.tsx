import type { Metadata } from "next";
import { getTestimonials } from "@/server/actions/admin/testimonials";
import { TestimonialsForm } from "@/components/admin/testimonials-form";

export const metadata: Metadata = { title: "המלצות | ניהול" };
export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  const testimonials = await getTestimonials();

  return (
    <div>
      <h1 className="text-2xl font-semibold">המלצות לקוחות</h1>
      <p className="mt-1 text-neutral-400">
        מוצגות בדף הבית. עברית חובה, אנגלית/ערבית אופציונלי.
      </p>
      <div className="mt-6 max-w-3xl">
        <TestimonialsForm
          initialValues={testimonials.map((t) => ({
            id: t.id,
            order: t.order,
            nameHe: t.nameHe,
            nameEn: t.nameEn ?? "",
            nameAr: t.nameAr ?? "",
            roleHe: t.roleHe ?? "",
            roleEn: t.roleEn ?? "",
            roleAr: t.roleAr ?? "",
            quoteHe: t.quoteHe,
            quoteEn: t.quoteEn ?? "",
            quoteAr: t.quoteAr ?? "",
            active: t.active,
          }))}
        />
      </div>
    </div>
  );
}
