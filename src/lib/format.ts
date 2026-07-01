/** מציג סכום באגורות (integer) כמחיר בשקלים, לפי locale. לעולם לא float בחישוב. */
export function formatAgorot(amountAgorot: number, locale: string): string {
  const shekels = amountAgorot / 100;
  return new Intl.NumberFormat(locale === "he" ? "he-IL" : locale === "ar" ? "ar-IL" : "en-IL", {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: shekels % 1 === 0 ? 0 : 2,
  }).format(shekels);
}
