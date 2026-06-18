import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // אחסון תמונות ב-Cloudflare R2 (יוגדר ב-Phase 4). דומיין ה-CDN יתווסף כאן.
    remotePatterns: [
      // { protocol: "https", hostname: "media.restyle.co.il" },
    ],
  },
};

export default withNextIntl(nextConfig);
