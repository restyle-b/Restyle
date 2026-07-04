import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import withSerwistInit from "@serwist/next";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// PWA (ראה docs/features/pwa.md) — כבוי בפיתוח בכוונה (מניעת cache מבלבל
// תוך כדי עבודה); register:false כי יש שני עצי <html> עצמאיים (אתר ציבורי
// + אדמין) שכל אחד נרשם בעצמו ל-scope שלו (RegisterServiceWorker), ולא
// לרישום האוטומטי הגלובלי היחיד של @serwist/next.
const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  register: false,
  disable: process.env.NODE_ENV === "development",
});

/**
 * Content-Security-Policy.
 * - הגופנים מוגשים עצמית ע"י next/font (מתוך /_next), לכן font-src 'self'.
 * - 'unsafe-inline' ל-style נדרש ע"י Tailwind/next; ל-script נדרש ע"י ה-bootstrap
 *   של Next App Router (ללא nonce). אין רינדור של HTML ממשתמש, לכן משטח ה-XSS מינימלי.
 * - connect-src ל-Supabase (REST + realtime), frame-src למפת Google בעמוד מיקום.
 */
// next dev עוטף מודולים ב-eval() (HMR/source maps) — בלי unsafe-eval כל
// האינטראקטיביות בצד הלקוח נשברת מקומית. ב-production הבאנדל לא משתמש ב-eval.
const scriptSrc =
  process.env.NODE_ENV === "production"
    ? "script-src 'self' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

const csp = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  // PWA: worker-src/manifest-src היו נכללים ב-default-src 'self' ממילא
  // (fallback לפי spec), אבל מוגדרים כאן במפורש כתיעוד-כוונה ובידוד משינויי
  // default-src עתידיים — ראה docs/features/pwa.md.
  "worker-src 'self'",
  "manifest-src 'self'",
  "frame-src https://www.google.com https://maps.google.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // לא לחשוף את הטכנולוגיה/גרסה (fingerprinting)
  poweredByHeader: false,
  images: {
    // אחסון תמונות ב-Cloudflare R2 (יוגדר ב-Phase 4). דומיין ה-CDN יתווסף כאן.
    remotePatterns: [
      // { protocol: "https", hostname: "media.restyle.co.il" },
    ],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default withSerwist(withNextIntl(nextConfig));
