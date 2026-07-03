import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";
import { routing } from "@/i18n/routing";
import { getPathname } from "@/i18n/navigation";

const routes = [
  "/",
  "/about",
  "/academy",
  "/gallery",
  "/locations",
  "/contact",
  "/accessibility",
  "/privacy",
  "/terms",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((href) => ({
    url: `${siteConfig.url}${getPathname({ href, locale: routing.defaultLocale })}`,
    lastModified: new Date(),
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((locale) => [locale, `${siteConfig.url}${getPathname({ href, locale })}`]),
      ),
    },
  }));
}
