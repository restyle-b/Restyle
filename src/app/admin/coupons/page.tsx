import type { Metadata } from "next";
import { getSimpleCoupons } from "@/server/actions/admin/coupons";
import { SimpleCouponsTable } from "@/components/admin/simple-coupons-table";

export const metadata: Metadata = { title: "קופונים | ניהול" };
export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const coupons = await getSimpleCoupons();

  return (
    <div>
      <h1 className="text-2xl font-semibold">קופונים</h1>
      <p className="mt-1 text-neutral-400">
        קוד הנחה שהלקוח מזין בקופה — מה שרואים זה מה שיש. הגדרות מתקדמות (תפוגה, סכום
        מינימום, תקרת שימושים, מוצרים מוחרגים) זמינות אך לא נדרשות. למבצעים אוטומטיים
        (בלי קוד, חלים על כל עגלה זכאית) יש עמוד נפרד — מבצעים אוטומטיים.
      </p>
      <div className="mt-6">
        <SimpleCouponsTable coupons={coupons} />
      </div>
    </div>
  );
}
