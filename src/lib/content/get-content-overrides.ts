import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { EDITABLE_NAMESPACES } from "@/lib/content/editable-namespaces";

export const CONTENT_BLOCKS_TAG = "content-blocks";

type NestedMessages = Record<string, unknown>;

function setPath(obj: NestedMessages, path: string, value: string) {
  const parts = path.split(".");
  const lastPart = parts[parts.length - 1] as string;
  let node = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i] as string;
    if (typeof node[part] !== "object" || node[part] === null) {
      node[part] = {};
    }
    node = node[part] as NestedMessages;
  }
  node[lastPart] = value;
}

function pickValue(locale: string, valueHe: string, valueEn: string | null, valueAr: string | null) {
  if (locale === "en" && valueEn) return valueEn;
  if (locale === "ar" && valueAr) return valueAr;
  return valueHe;
}

/**
 * שולף את כל ה-ContentBlock עבור namespaces הניתנים לעריכה ובונה אובייקט
 * messages חלקי (namespace -> נתיב מקונן -> טקסט) ל-locale הנתון. נכשל בשקט
 * (מחזיר {}) אם ה-DB לא נגיש — האתר חייב להמשיך לעבוד עם ה-JSON הסטטי
 * כ-fallback (ראה docs/ARCHITECTURE.md §5.1).
 */
async function fetchContentOverrides(locale: string): Promise<NestedMessages> {
  try {
    const rows = await db.contentBlock.findMany({
      where: { namespace: { in: [...EDITABLE_NAMESPACES] } },
    });
    const result: NestedMessages = {};
    for (const row of rows) {
      if (!result[row.namespace]) result[row.namespace] = {};
      const value = pickValue(locale, row.valueHe, row.valueEn, row.valueAr);
      setPath(result[row.namespace] as NestedMessages, row.key, value);
    }
    return result;
  } catch (err) {
    console.error("[content] failed to load ContentBlock overrides:", err);
    return {};
  }
}

const cachedFetchContentOverrides = unstable_cache(fetchContentOverrides, ["content-overrides"], {
  tags: [CONTENT_BLOCKS_TAG],
});

export async function getContentOverrides(locale: string): Promise<NestedMessages> {
  return cachedFetchContentOverrides(locale);
}

function deepMerge(base: NestedMessages, overrides: NestedMessages): NestedMessages {
  const result: NestedMessages = { ...base };
  for (const [key, value] of Object.entries(overrides)) {
    const baseValue = result[key];
    if (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      baseValue !== null &&
      typeof baseValue === "object" &&
      !Array.isArray(baseValue)
    ) {
      result[key] = deepMerge(baseValue as NestedMessages, value as NestedMessages);
    } else {
      result[key] = value;
    }
  }
  return result;
}

export function mergeContentOverrides(
  messages: NestedMessages,
  overrides: NestedMessages,
): NestedMessages {
  return deepMerge(messages, overrides);
}
