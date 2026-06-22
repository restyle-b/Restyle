import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { routing } from "@/i18n/routing";
import { getClientEnv } from "@/lib/env";

const intlMiddleware = createMiddleware(routing);

const PROTECTED_SEGMENTS = ["/account", "/admin"];
const LOCALE_PREFIXES = ["/en", "/ar"];

function splitLocale(pathname: string) {
  const prefix = LOCALE_PREFIXES.find((p) => pathname === p || pathname.startsWith(`${p}/`));
  return { prefix: prefix ?? "", rest: prefix ? pathname.slice(prefix.length) || "/" : pathname };
}

export async function middleware(request: NextRequest) {
  const intlResponse = intlMiddleware(request);
  if (intlResponse.headers.get("location")) return intlResponse;

  const { prefix, rest } = splitLocale(request.nextUrl.pathname);
  const isProtected = PROTECTED_SEGMENTS.some((p) => rest.startsWith(p));

  // אנטי-DoS + ביצועים: getUser() פונה לשרת ה-Auth של Supabase. בלי הסינון הזה
  // כל hit לעמוד ציבורי (גם אנונימי) היה מייצר קריאת auth יוצאת — הגברת DoS
  // (הצפת האתר → הצפת Supabase → מיצוי מכסה/חסימה). פונים רק אם הנתיב מוגן או
  // אם קיים cookie של session (משתמש מחובר שצריך רענון).
  const hasAuthCookie = request.cookies.getAll().some((c) => c.name.startsWith("sb-"));
  if (!isProtected && !hasAuthCookie) {
    return intlResponse;
  }

  const env = getClientEnv();
  let response = intlResponse;
  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          // לשמר rewrite/cookies שכבר הוגדרו ע"י intlMiddleware (למשל "/" -> locale ברירת מחדל)
          const refreshed = NextResponse.next({ request });
          for (const [key, value] of intlResponse.headers) {
            if (key.toLowerCase() !== "set-cookie") refreshed.headers.set(key, value);
          }
          for (const cookie of intlResponse.cookies.getAll()) {
            refreshed.cookies.set(cookie);
          }
          response = refreshed;
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const { data } = await supabase.auth.getUser();

  if (isProtected && !data.user) {
    const redirectUrl = new URL(`${prefix}/login`, request.url);
    redirectUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  // לא להריץ את ה-middleware על נכסים סטטיים וקבצי SEO (robots.txt/sitemap.xml),
  // אחרת next-intl מנסה לפרש אותם כנתיב locale ומחזיר 404.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
