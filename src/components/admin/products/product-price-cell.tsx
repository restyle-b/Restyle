"use client";

import { updateProductPrice } from "@/server/actions/admin/products";
import { InlineEditableCell } from "@/components/admin/products/inline-editable-cell";
import { formatAgorot } from "@/lib/format";

export function ProductPriceCell({ id, priceAgorot }: { id: string; priceAgorot: number }) {
  return (
    <InlineEditableCell
      value={(priceAgorot / 100).toString()}
      displayValue={formatAgorot(priceAgorot, "he")}
      ariaLabel="מחיר (₪)"
      onSave={(raw) => updateProductPrice(id, raw)}
    />
  );
}
