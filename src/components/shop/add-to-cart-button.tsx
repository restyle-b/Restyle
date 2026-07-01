"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useCart } from "@/lib/cart/cart-context";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  const t = useTranslations("shop");
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

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
      {added ? t("addToCart") + " ✓" : t("addToCart")}
    </button>
  );
}
