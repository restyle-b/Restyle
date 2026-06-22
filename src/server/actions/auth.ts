"use server";

import { headers } from "next/headers";
import {
  signUpSchema,
  signInSchema,
  requestPasswordResetSchema,
  updatePasswordSchema,
} from "@/lib/auth-schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/config";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export type AuthActionResult = { ok: true } | { ok: false; error: string };

const GENERIC_SIGN_IN_ERROR = "אימייל או סיסמה שגויים";
const RATE_LIMITED_ERROR = "יותר מדי ניסיונות — נסו שוב בעוד דקה";

const PROD_HOST = new URL(siteConfig.url).host;

/**
 * בונה origin לקישורי auth (אימות מייל / איפוס סיסמה). מאמת את ה-host מול
 * allowlist כדי למנוע Host Header Poisoning (קישור איפוס שמצביע לדומיין תוקף).
 * נופל ל-siteConfig.url אם ה-host אינו מוכר.
 */
async function getOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const protocol = h.get("x-forwarded-proto") ?? "https";
  const allowed =
    host === PROD_HOST ||
    host.endsWith(".vercel.app") ||
    host === "localhost" ||
    host.startsWith("localhost:");
  return allowed ? `${protocol}://${host}` : siteConfig.url;
}

export async function signUp(input: unknown): Promise<AuthActionResult> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }

  // honeypot מלא => התעלמות שקטה, מציגים הצלחה כדי לא לחשוף את המנגנון לבוטים
  if (parsed.data.company) {
    return { ok: true };
  }

  const ip = await getClientIp();
  if (!rateLimit(`signup:${ip}`, 5, 60_000).ok) {
    return { ok: false, error: RATE_LIMITED_ERROR };
  }

  const { name, email, password } = parsed.data;

  // try/catch — חריגה לא צפויה (לדוגמה תקלת רשת/קונפיגורציה) חייבת להחזיר
  // תשובה מסודרת ולא להתפוצץ באמצע ה-Server Action, אחרת ה-UI נשאר תלוי
  // (הכפתור חוזר ל-idle בלי שום הודעה, כי setStatus/setServerError בלקוח לא מגיעים להתבצע).
  try {
    const supabase = await createSupabaseServerClient();
    const origin = await getOrigin();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      // הודעה גנרית — לא לרמוז על קיום האימייל במערכת (account enumeration)
      console.error("[auth] signUp failed:", error.message);
      return { ok: false, error: "ההרשמה נכשלה, נסו שוב מאוחר יותר" };
    }

    return { ok: true };
  } catch (err) {
    console.error("[auth] signUp threw:", err);
    return { ok: false, error: "ההרשמה נכשלה, נסו שוב מאוחר יותר" };
  }
}

export async function signIn(input: unknown): Promise<AuthActionResult> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }

  const ip = await getClientIp();
  if (!rateLimit(`signin:${ip}`, 10, 60_000).ok) {
    return { ok: false, error: RATE_LIMITED_ERROR };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);

    if (error) {
      console.error("[auth] signIn failed:", error.message);
      return { ok: false, error: GENERIC_SIGN_IN_ERROR };
    }

    return { ok: true };
  } catch (err) {
    console.error("[auth] signIn threw:", err);
    return { ok: false, error: GENERIC_SIGN_IN_ERROR };
  }
}

export async function signOut(): Promise<AuthActionResult> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  return { ok: true };
}

export async function requestPasswordReset(input: unknown): Promise<AuthActionResult> {
  const parsed = requestPasswordResetSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }

  // rate limit שקט — מחזירים הצלחה בלי לשלוח, כדי לא לחשוף קיום מייל ולמנוע הצפה
  const ip = await getClientIp();
  if (!rateLimit(`reset:${ip}`, 3, 60_000).ok) {
    return { ok: true };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const origin = await getOrigin();

    // לא חושפים אם המייל קיים במערכת — מחזירים הצלחה בכל מקרה
    await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${origin}/auth/callback?next=/reset-password`,
    });
  } catch (err) {
    console.error("[auth] requestPasswordReset threw:", err);
  }

  return { ok: true };
}

export async function updatePassword(input: unknown): Promise<AuthActionResult> {
  const parsed = updatePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      return { ok: false, error: "הפעולה אינה זמינה — נסו לבקש קישור איפוס חדש" };
    }

    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    if (error) {
      return { ok: false, error: "עדכון הסיסמה נכשל, נסו שוב" };
    }

    return { ok: true };
  } catch (err) {
    console.error("[auth] updatePassword threw:", err);
    return { ok: false, error: "עדכון הסיסמה נכשל, נסו שוב" };
  }
}
