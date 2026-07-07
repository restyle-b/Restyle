"use client";

import { useEffect } from "react";
import { recordRecentlyViewed } from "@/lib/account/recently-viewed";

/**
 * רכיב "שקוף" (לא מרנדר כלום) שמוצמד לדף המוצר — רושם ל-localStorage
 * בעת צפייה, כדי שכרטיס "נצפו לאחרונה" בדשבורד האישי יהיה משמעותי.
 */
export function RecordRecentlyViewed({
  productId,
  slug,
  name,
  imageUrl,
  priceAgorot,
}: {
  productId: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  priceAgorot: number;
}) {
  useEffect(() => {
    recordRecentlyViewed({ productId, slug, name, imageUrl, priceAgorot });
  }, [productId, slug, name, imageUrl, priceAgorot]);

  return null;
}
