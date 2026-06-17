import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getClientEnv } from "@/lib/env";

/**
 * לקוח Supabase לצד שרת (Server Components, Server Actions, Route Handlers).
 * ב-Server Components בלבד אי אפשר לכתוב cookies — ה-middleware אחראי על חידוש
 * ה-session בכל בקשה, ולכן ה-`set`/`remove` כאן עטופים ב-try/catch לפי תיעוד Supabase.
 */
export async function createSupabaseServerClient() {
  const env = getClientEnv();
  const cookieStore = await cookies();

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // נקרא מ-Server Component — ה-middleware מטפל בחידוש ה-session
        }
      },
    },
  });
}
