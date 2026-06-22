import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // עמודי auth/אזור אישי — אין ערך SEO ואין סיבה לחשוף לזחלנים
      disallow: ["/account", "/login", "/register", "/forgot-password", "/reset-password", "/auth/"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
