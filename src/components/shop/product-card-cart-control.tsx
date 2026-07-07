"use client";

import { useTranslations } from "next-intl";
import { useCart } from "@/lib/cart/cart-context";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAX_QUANTITY = 99;

/**
 * הוספה לעגלה + עדכון כמות ישירות מכרטיס המוצר (קטלוג/דף הבית), בלי לעבור
 * דרך דף המוצר. יושב מחוץ ל-Link של הכרטיס (לא בתוכו) כדי שלחיצה על
 * הכפתורים לא תנווט לדף המוצר.
 */
export function ProductCardCartControl({
  productId,
  slug,
  name,
  priceAgorot,
  imageUrl,
}: {
  productId: string;
  slug: string;
  name: string;
  priceAgorot: number;
  imageUrl: string | null;
}) {
  const tShop = useTranslations("shop");
  const tCart = useTranslations("cart");
  const { items, addItem, setQuantity } = useCart();
  const item = items.find((i) => i.productId === productId);

  if (!item) {
    return (
      <button
        type="button"
        onClick={() => addItem({ productId, slug, name, priceAgorot, imageUrl })}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-3 w-full justify-center text-white")}
      >
        {tShop("addToCart")}
      </button>
    );
  }

  return (
    <div
      role="group"
      aria-label={tCart("quantityLabel")}
      className="mt-3 flex items-center justify-between rounded-full border border-line-dark px-1 py-1"
    >
      <button
        type="button"
        onClick={() => setQuantity(productId, item.quantity - 1)}
        aria-label={tCart("decreaseQuantity")}
        className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-300 transition-colors hover:bg-current/10 hover:text-accent"
      >
        −
      </button>
      <span className="text-sm font-medium text-white">{item.quantity}</span>
      <button
        type="button"
        disabled={item.quantity >= MAX_QUANTITY}
        onClick={() => setQuantity(productId, item.quantity + 1)}
        aria-label={tCart("increaseQuantity")}
        className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-300 transition-colors hover:bg-current/10 hover:text-accent disabled:pointer-events-none disabled:opacity-50"
      >
        +
      </button>
    </div>
  );
}
