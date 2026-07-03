/**
 * מחיר אפקטיבי (מבצע אם תקף) — מקור אמת יחיד, נקרא גם בקטלוג הציבורי
 * (get-products.ts) וגם ב-checkout (create-order.ts) כדי שהתצוגה והחיוב
 * לעולם לא יסתטרו זה מזה.
 */
export function getEffectivePriceAgorot(priceAgorot: number, salePriceAgorot: number | null): number {
  if (salePriceAgorot !== null && salePriceAgorot > 0 && salePriceAgorot < priceAgorot) {
    return salePriceAgorot;
  }
  return priceAgorot;
}
