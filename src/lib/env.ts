import { z } from "zod";

/**
 * אימות משתני סביבה ב-zod (ראה docs/SETUP.md).
 * משתני server נשארים בשרת בלבד; רק NEXT_PUBLIC_* נחשפים לקליינט.
 * ⚠️ ייובא ויאוכף משלב חיבור Supabase/R2 (Phase 3+). כרגע משמש כחוזה.
 */
const serverSchema = z.object({
  DATABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET: z.string().min(1),
  BREVO_API_KEY: z.string().min(1).optional(),
  BREVO_SENDER_EMAIL: z.string().email().optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

export function getServerEnv() {
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`משתני סביבה (server) חסרים/שגויים:\n${parsed.error.message}`);
  }
  return parsed.data;
}

export function getClientEnv() {
  const parsed = clientSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
  if (!parsed.success) {
    throw new Error(`משתני סביבה (client) חסרים/שגויים:\n${parsed.error.message}`);
  }
  return parsed.data;
}
