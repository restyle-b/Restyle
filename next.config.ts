import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/**
 * Content-Security-Policy.
 * - הגופנים מוגשים עצמית ע"י next/font (מתוך /_next), לכן font-src 'self'.
 * - 'unsafe-inline' ל-style נדרש ע"י Tailwind/next; ל-script נדרש ע"י ה-bootstrap
 *   של Next App Router (ללא nonce). אין רינדור של HTML ממשתמש, לכן משטח ה-XSS מינימלי.
 * - connect-src ל-Supabase (REST + realtime), frame-src למפת Google בעמוד מיקום.
 */
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
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

export default withNextIntl(nextConfig);
