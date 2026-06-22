import { headers } from "next/headers";

/**
 * Rate limiter פשוט בזיכרון (sliding window לפי מפתח).
 *
 * ⚠️ מגבלה: ב-Vercel serverless לכל instance זיכרון נפרד ו-instances ממוחזרים,
 * לכן זו הגנה best-effort שמעלה את הרף מול ספאם/brute-force בסיסי — אך אינה
 * תחליף ל-rate limiting מבוזר. לפרודקשן עם תנועה אמיתית: לעבור ל-Vercel KV /
 * Upstash Redis (ראה ROADMAP, Phase 10).
 */
type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

export type RateLimitResult = { ok: boolean; retryAfter: number };

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();

  // ניקוי אופורטוניסטי כדי שה-Map לא יגדל ללא הגבלה
  if (store.size > 5000) {
    for (const [k, v] of store) {
      if (now > v.resetAt) store.delete(k);
    }
  }

  const entry = store.get(key);
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }

  if (entry.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  return { ok: true, retryAfter: 0 };
}

/**
 * כתובת ה-IP של הלקוח. ⚠️ קריטי: `x-real-ip` מוגדר ע"י הפרוקסי של Vercel
 * ואינו ניתן לזיוף ע"י הלקוח. אסור להשתמש ב-entry השמאלי של `x-forwarded-for`
 * כי הוא נשלט ע"י הלקוח (אפשר לזייף IP אקראי בכל בקשה ולעקוף את ה-rate-limit
 * לחלוטין + לנפח את ה-Map בזיכרון). ה-fallback ל-XFF לוקח את ה-entry האחרון
 * (זה שהוסיף הפרוקסי הקרוב), לא הראשון.
 */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const realIp = h.get("x-real-ip");
  if (realIp) return realIp.trim();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",");
    return parts[parts.length - 1]!.trim();
  }
  return "unknown";
}
