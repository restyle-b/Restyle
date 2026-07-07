import type { Metadata } from "next";
import { getPromotions } from "@/server/actions/admin/promotions";
import { PromotionsTable } from "@/components/admin/promotions-table";

export const metadata: Metadata = { title: "מבצעים אוטומטיים | ניהול" };
export const dynamic = "force-dynamic";

export default async function AdminPromotionsPage() {
  const promotions = await getPromotions();

  return (
    <div>
      <h1 className="text-2xl font-semibold">מבצעים אוטומטיים</h1>
      <p className="mt-1 text-neutral-400">
        הנחות שחלות אוטומטית על כל עגלה זכאית, בלי קוד. לקוד הנחה שהלקוח מזין בקופה — עמוד
        קופונים. ניתן גם לצרף קודי קופון תחת מבצע כאן (כולל יצירה בכמות) לצרכים מתקדמים.
      </p>
      <div className="mt-6">
        <PromotionsTable promotions={promotions} />
      </div>
    </div>
  );
}
