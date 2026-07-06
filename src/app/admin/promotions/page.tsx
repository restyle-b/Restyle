import type { Metadata } from "next";
import { getPromotions } from "@/server/actions/admin/promotions";
import { PromotionsTable } from "@/components/admin/promotions-table";

export const metadata: Metadata = { title: "מבצעים וקופונים | ניהול" };
export const dynamic = "force-dynamic";

export default async function AdminPromotionsPage() {
  const promotions = await getPromotions();

  return (
    <div>
      <h1 className="text-2xl font-semibold">מבצעים וקופונים</h1>
      <p className="mt-1 text-neutral-400">
        הנחות אוטומטיות וקודי קופון לחנות. סימולציית ההנחה בפועל בעגלה/בקופה היא זרם נפרד.
      </p>
      <div className="mt-6">
        <PromotionsTable promotions={promotions} />
      </div>
    </div>
  );
}
