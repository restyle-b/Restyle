"use server";

import { headers } from "next/headers";
import {
  signUpSchema,
  signInSchema,
  requestPasswordResetSchema,
  updatePasswordSchema,
} from "@/lib/auth-schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthActionResult = { ok: true } | { ok: false; error: string };

const GENERIC_SIGN_IN_ERROR = "אימייל או סיסמה שגויים";

async function getOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const protocol = h.get("x-forwarded-proto") ?? "https";
  return `${protocol}://${host}`;
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

  const { name, email, password } = parsed.data;
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
    console.error("[auth] signUp failed:", error.message);
    return { ok: false, error: "ההרשמה נכשלה — ייתכן שהאימייל הזה כבר רשום" };
  }

  return { ok: true };
}

export async function signIn(input: unknown): Promise<AuthActionResult> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    console.error("[auth] signIn failed:", error.message);
    return { ok: false, error: GENERIC_SIGN_IN_ERROR };
  }

  return { ok: true };
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

  const supabase = await createSupabaseServerClient();
  const origin = await getOrigin();

  // לא חושפים אם המייל קיים במערכת — מחזירים הצלחה בכל מקרה
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  return { ok: true };
}

export async function updatePassword(input: unknown): Promise<AuthActionResult> {
  const parsed = updatePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "קלט לא תקין" };
  }

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
}
