"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { toast } from "sonner";
import { updateProductSalePrice } from "@/server/actions/admin/products";
import { InlineEditableCell } from "@/components/admin/products/inline-editable-cell";
import { formatAgorot } from "@/lib/format";

export function ProductSalePriceCell({
  id,
  salePriceAgorot,
}: {
  id: string;
  salePriceAgorot: number | null;
}) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-1">
      <InlineEditableCell
        value={salePriceAgorot !== null ? (salePriceAgorot / 100).toString() : ""}
        displayValue={
          salePriceAgorot !== null ? (
            <span className="text-accent">{formatAgorot(salePriceAgorot, "he")}</span>
          ) : (
            <span className="text-neutral-500">הוספת מבצע</span>
          )
        }
        ariaLabel="מחיר מבצע (₪)"
        onSave={(raw) => updateProductSalePrice(id, raw)}
      />
      {salePriceAgorot !== null && (
        <button
          type="button"
          onClick={async () => {
            const result = await updateProductSalePrice(id, null);
            if (result.ok) {
              router.refresh();
            } else {
              toast.error(result.error);
            }
          }}
          aria-label="ביטול מחיר מבצע"
          className="rounded-md p-1 text-neutral-500 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
