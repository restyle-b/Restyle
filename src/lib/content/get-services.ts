import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { serviceSlugs } from "@/lib/services-data";

export const SERVICES_TAG = "services";

export type ServiceItem = { slug: string; name: string; description: string };

function pick(locale: string, he: string, en: string | null, ar: string | null) {
  if (locale === "en" && en) return en;
  if (locale === "ar" && ar) return ar;
  return he;
}

async function fetchServices(): Promise<
  { slug: string; nameHe: string; nameEn: string | null; nameAr: string | null; descriptionHe: string; descriptionEn: string | null; descriptionAr: string | null }[]
> {
  try {
    return await db.service.findMany({ where: { active: true }, orderBy: { order: "asc" } });
  } catch (err) {
    console.error("[content] failed to load services:", err);
    return [];
  }
}

const cachedFetchServices = unstable_cache(fetchServices, ["services-list"], {
  tags: [SERVICES_TAG],
});

/**
 * שירותי המספרה ל-locale הנתון. אם ה-DB ריק/לא נגיש (לפני הרצת המיגרציה
 * הידנית, ראה prisma/migrations/20260623000000_admin_content_cms) — נופל
 * חזרה לתוכן הסטטי הקיים ב-messages/*.json, כדי שהאתר ימשיך לעבוד.
 */
export async function getServices(locale: string): Promise<ServiceItem[]> {
  const rows = await cachedFetchServices();
  if (rows.length > 0) {
    return rows.map((r) => ({
      slug: r.slug,
      name: pick(locale, r.nameHe, r.nameEn, r.nameAr),
      description: pick(locale, r.descriptionHe, r.descriptionEn, r.descriptionAr),
    }));
  }

  const messages = (await import(`../../../messages/${locale}.json`)).default;
  return serviceSlugs.map((slug) => ({
    slug,
    name: messages.servicesData[slug].name,
    description: messages.servicesData[slug].description,
  }));
}
