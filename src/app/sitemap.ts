import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";

const routes = ["", "/about", "/services", "/gallery", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
  }));
}
