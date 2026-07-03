// ה-slug נוצר אוטומטית בשרת (מתוך השם באנגלית) ולעולם לא מוצג/נערך ע"י האדמין.
// הפונקציה מייצרת slug ייחודי: מסלגת את nameEn, נופלת ל-base אקראי אם אין
// אנגלית (למשל שם בעברית בלבד), ומוסיפה סיומת אקראית עד לייחודיות מול existing.

function randomSuffix(length: number): string {
  return Math.random()
    .toString(36)
    .slice(2, 2 + length);
}

export function generateSlug(
  nameEn: string | null | undefined,
  existing: Set<string>,
): string {
  const base =
    (nameEn ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || `item-${randomSuffix(6)}`;

  let candidate = base;
  while (existing.has(candidate)) {
    candidate = `${base}-${randomSuffix(4)}`;
  }
  return candidate;
}
