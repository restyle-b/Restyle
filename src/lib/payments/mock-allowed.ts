/**
 * שער בטיחות ל-MockProvider — ספק התשלום המדומה מיועד לפיתוח/preview בלבד
 * ולעולם לא לשמש checkout אמיתי. הוא **מסרב לפעול ב-production** אלא אם ניתן
 * opt-in מפורש `ALLOW_MOCK_CHECKOUT=true` (למשל preview שמדגים את הזרימה לפני
 * שיש credentials אמיתיים של Tranzila).
 *
 * למה זה קריטי: ברירת המחדל של `PAYMENT_PROVIDER` היא "mock", ומסלול ה-mock
 * מסמן הזמנה כ-PAID בלי חיוב אמיתי. בלי השער הזה, אתר שעולה ל-production בלי
 * להגדיר `PAYMENT_PROVIDER=tranzila` היה מאפשר לכל מבקר לבצע "רכישה" חינם
 * (הזמנה מסומנת שולם + מלאי יורד + מייל אישור) — כשל closed הוא חובה כאן.
 */
export function isMockCheckoutAllowed(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  return process.env.ALLOW_MOCK_CHECKOUT === "true";
}
