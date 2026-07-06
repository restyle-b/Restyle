"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAX_QUANTITY = 99;

/**
 * כפתור "הוספה לעגלה" בדף המוצר. אחרי ההוספה עובר לבקרת כמות +/- (אותה
 * התנהגות בדיוק כמו ProductCardCartControl בכרטיס הקטלוג — הפחתה עד 0
 * מסירה מהעגלה) + כפתור "הסרה" מפורש (trash) לביטול מיידי וברור, בלי
 * צורך ללחוץ מינוס שוב ושוב.
 */
export function AddToCartButton({
  productId,
  slug,
  name,
  priceAgorot,
  imageUrl,
  inStock,
}: {
  productId: string;
  slug: string;
  name: string;
  priceAgorot: number;
  imageUrl: string | null;
  inStock: boolean;
}) {
  const tShop = useTranslations("shop");
  const tCart = useTranslations("cart");
  const { items, addItem, removeItem, setQuantity } = useCart();
  const [added, setAdded] = useState(false);
  const item = items.find((i) => i.productId === productId);

  if (!item) {
    return (
      <button
        type="button"
        disabled={!inStock}
        onClick={() => {
          addItem({ productId, slug, name, priceAgorot, imageUrl });
          setAdded(true);
          window.setTimeout(() => setAdded(false), 1500);
        }}
        className={cn(buttonVariants({ size: "lg" }), "mt-6")}
      >
        {added ? tShop("addToCart") + " ✓" : tShop("addToCart")}
      </button>
    );
  }

  return (
    <div className="mt-6 flex items-center gap-3">
      <div
        role="group"
        aria-label={tCart("quantityLabel")}
        className="flex items-center gap-1 rounded-full border border-line-dark px-1 py-1"
      >
        <button
          type="button"
          onClick={() => setQuantity(productId, item.quantity - 1)}
          aria-label={tCart("decreaseQuantity")}
          className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-neutral-300 transition-colors hover:bg-current/10 hover:text-accent"
        >
          −
        </button>
        <span className="w-8 text-center text-base font-medium text-white">{item.quantity}</span>
        <button
          type="button"
          disabled={item.quantity >= MAX_QUANTITY}
          onClick={() => setQuantity(productId, item.quantity + 1)}
          aria-label={tCart("increaseQuantity")}
          className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-neutral-300 transition-colors hover:bg-current/10 hover:text-accent disabled:pointer-events-none disabled:opacity-50"
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={() => removeItem(productId)}
        aria-label={tCart("remove")}
        className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-white/10 hover:text-red-400"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
