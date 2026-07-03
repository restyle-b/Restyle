import { Badge } from "@/components/ui/badge";
import { getStockHealth } from "@/lib/admin/product-schema";

const LABEL = { out: "אזל", low: "מלאי נמוך", healthy: "במלאי" } as const;
const TONE = { out: "danger", low: "warning", healthy: "success" } as const;

export function StockHealthBadge({ stock }: { stock: number }) {
  const health = getStockHealth(stock);
  return (
    <Badge tone={TONE[health]} dot>
      {LABEL[health]}
    </Badge>
  );
}
