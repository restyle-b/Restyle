import Link from "next/link";
import { formatAgorot } from "@/lib/format";
import { monochromeScale } from "@/lib/admin/chart-colors";
import type { TopProductRow } from "@/server/actions/admin/dashboard";

const TRACK_WIDTH = 100;
const BAR_HEIGHT = 10;

/**
 * "מוצרים מובילים" — 5 עמודות אופקיות. הרינדור עצמו הוא <rect> ב-SVG שמעוגן
 * תמיד לקצה הימני של ה-viewBox (x = 100-pct), כך שהעמודה גדלה מימין ללא
 * תלות בכיווניות ה-DOM — תואם RTL. השם/הסכום מוצגים כטקסט HTML רגיל (עברית
 * נכונה, קיצור טקסט), לא כטקסט SVG.
 */
export function TopProductsChart({ products }: { products: TopProductRow[] }) {
  if (products.length === 0) {
    return <p className="py-8 text-center text-sm text-neutral-400">אין עדיין מכירות ב-30 הימים האחרונים.</p>;
  }

  const maxRevenue = Math.max(...products.map((p) => p.revenueAgorot));

  return (
    <ul className="space-y-4">
      {products.map((product, i) => {
        const pct = maxRevenue > 0 ? (product.revenueAgorot / maxRevenue) * 100 : 0;
        const color = monochromeScale(i, products.length);
        return (
          <li key={product.id}>
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <Link href="/admin/products" className="truncate text-neutral-200 hover:text-white">
                {product.nameHe}
              </Link>
              <span className="shrink-0 text-xs text-neutral-400 [font-variant-numeric:tabular-nums]">
                {formatAgorot(product.revenueAgorot, "he")}
              </span>
            </div>
            <svg
              viewBox={`0 0 ${TRACK_WIDTH} ${BAR_HEIGHT}`}
              preserveAspectRatio="none"
              className="mt-1.5 h-2.5 w-full"
              aria-hidden="true"
            >
              <rect x={0} y={0} width={TRACK_WIDTH} height={BAR_HEIGHT} rx={2} className="fill-white/5" />
              <rect x={TRACK_WIDTH - pct} y={0} width={pct} height={BAR_HEIGHT} rx={2} fill={color} />
            </svg>
          </li>
        );
      })}
    </ul>
  );
}
