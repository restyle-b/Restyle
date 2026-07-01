import { z } from "zod";

/**
 * אימות משתני סביבה ב-zod (ראה docs/SETUP.md).
 * משתני server נשארים בשרת בלבד; רק NEXT_PUBLIC_* נחשפים לקליינט.
 * ⚠️ ייובא ויאוכף משלב חיבור Supabase/R2 (Phase 3+). כרגע משמש כחוזה.
 */
const serverSchema = z
  .object({
    DATABASE_URL: z.string().url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    R2_ACCOUNT_ID: z.string().min(1),
    R2_ACCESS_KEY_ID: z.string().min(1),
    R2_SECRET_ACCESS_KEY: z.string().min(1),
    R2_BUCKET: z.string().min(1),
    BREVO_API_KEY: z.string().min(1).optional(),
    BREVO_SENDER_EMAIL: z.string().email().optional(),
    // תשלומים (Stage 2, Phase 5) — ראה docs/features/shop.md ו-
    // .claude/skills/tranzila-payments/SKILL.md. ברירת מחדל "mock" — לא
    // דורש שום סוד. "tranzila" דורש את שני משתני הטרמינל (נאכף למטה).
    PAYMENT_PROVIDER: z.enum(["mock", "tranzila"]).default("mock"),
    PAYMENT_WEBHOOK_SECRET: z.string().min(1).optional(),
    TRANZILA_TERMINAL: z.string().min(1).optional(),
    TRANZILA_TERMINAL_PASSWORD: z.string().min(1).optional(),
    // opt-in מפורש להפעלת MockProvider ב-production (preview/דמו בלבד) —
    // ראה src/lib/payments/mock-allowed.ts. ברירת מחדל: mock חסום ב-production.
    ALLOW_MOCK_CHECKOUT: z.enum(["true", "false"]).optional(),
  })
  .superRefine((env, ctx) => {
    if (env.PAYMENT_PROVIDER === "tranzila" && (!env.TRANZILA_TERMINAL || !env.TRANZILA_TERMINAL_PASSWORD)) {
      ctx.addIssue({
        code: "custom",
        message:
          "PAYMENT_PROVIDER=tranzila דורש גם TRANZILA_TERMINAL וגם TRANZILA_TERMINAL_PASSWORD",
        path: ["PAYMENT_PROVIDER"],
      });
    }
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
