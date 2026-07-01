/**
 * פריט בעגלה — נשמר ב-localStorage בצד לקוח בלבד. `priceAgorot`/`name` כאן
 * הם רק **cache לתצוגה** (מציגים עגלה בלי round-trip ל-DB) — הצ'קאאוט לעולם
 * לא סומך על הערכים האלה; המחיר/שם האמיתיים נקראים מחדש מה-DB בזמן יצירת
 * ההזמנה (src/server/actions/shop/create-order.ts).
 */
export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  priceAgorot: number;
  imageUrl: string | null;
  quantity: number;
};

export type CartState = {
  items: CartItem[];
};
