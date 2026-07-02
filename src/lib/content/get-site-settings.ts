import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { siteConfig } from "@/lib/config";

export const SITE_SETTINGS_TAG = "site-settings";

export type SiteContactInfo = {
  phone: string;
  email: string;
  address: string;
  whatsapp: string;
  instagramUrl: string | null;
  facebookUrl: string | null;
  appStoreUrl: string | null;
  googlePlayUrl: string | null;
};

async function fetchSiteSettings() {
  try {
    return await db.siteSettings.findUnique({ where: { id: 1 } });
  } catch (err) {
    console.error("[content] failed to load site settings:", err);
    return null;
  }
}

const cachedFetchSiteSettings = unstable_cache(fetchSiteSettings, ["site-settings"], {
  tags: [SITE_SETTINGS_TAG],
  revalidate: 300,
});

/**
 * פרטי קשר לתצוגה ציבורית (טלפון/אימייל/כתובת/וואטסאפ/רשתות). נופל חזרה
 * ל-siteConfig הסטטי אם ה-DB ריק/לא נגיש — לא שובר את האתר אם אין שורה.
 */
export async function getSiteContactInfo(): Promise<SiteContactInfo> {
  const row = await cachedFetchSiteSettings();
  if (row) {
    return {
      phone: row.phone,
      email: row.email,
      address: row.address,
      whatsapp: row.whatsapp,
      instagramUrl: row.instagramUrl,
      facebookUrl: row.facebookUrl,
      appStoreUrl: row.appStoreUrl,
      googlePlayUrl: row.googlePlayUrl,
    };
  }

  return {
    phone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
    address: siteConfig.contact.address,
    whatsapp: siteConfig.contact.whatsapp,
    instagramUrl: null,
    facebookUrl: null,
    appStoreUrl: null,
    googlePlayUrl: null,
  };
}
