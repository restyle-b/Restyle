"use client";

import { updateProductStock } from "@/server/actions/admin/products";
import { InlineEditableCell } from "@/components/admin/products/inline-editable-cell";
import { StockHealthBadge } from "@/components/admin/products/stock-health-badge";

export function ProductStockCell({ id, stock }: { id: string; stock: number }) {
  return (
    <div className="flex items-center gap-2">
      <InlineEditableCell
        value={stock.toString()}
        displayValue={stock}
        ariaLabel="כמות במלאי"
        inputMode="numeric"
        onSave={async (raw) => {
          const num = Number(raw);
          if (!Number.isInteger(num) || num < 0) return { ok: false, error: "כמות לא תקינה" };
          return updateProductStock(id, num);
        }}
      />
      <StockHealthBadge stock={stock} />
    </div>
  );
}
