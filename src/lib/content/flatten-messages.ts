type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

/**
 * משטח אובייקט מקונן ל-key/value בנקודות (לדוגמה "hero.title"), כדי להציג כל
 * פסקה/שדה כשורה נפרדת בעריכת Admin. מדלג על arrays/non-string — namespace
 * אלה לא ניתנים לעריכה דרך ה-CMS הגנרי (ראה editable-namespaces.ts).
 */
export function flattenMessages(obj: Json, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
    return out;
  }
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      out[path] = value;
    } else if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(out, flattenMessages(value, path));
    }
  }
  return out;
}
