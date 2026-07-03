import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { siteConfig } from "@/lib/config";

export const SITE_SETTINGS_TAG = "site-settings";

export type SiteContactInfo = {
  phone: string;
  email: string;
  address: string;
  whatsapp: string;
  instagramUrl: string;
  appStoreUrl: string;
  googlePlayUrl: string;
};

async function fetchSiteSettings() {
  try {
    return await db.siteSettings.findUnique({ where: { id: 1 } });
  } catch (err) {
    console.error("[content] failed to load site settings:", err);
    return null;
  }
}

const cachedFetchSiteSettings = unstable_cache(fetchSiteSettings, ["site-settings-row"], {
  tags: [SITE_SETTINGS_TAG],
  revalidate: 300,
});

/** פרטי קשר ציבוריים — DB-primary, נופל חזרה ל-siteConfig אם השורה חסרה/שדה ריק. */
export async function getSiteContactInfo(): Promise<SiteContactInfo> {
  const row = await cachedFetchSiteSettings();
  return {
    phone: row?.phone || siteConfig.contact.phone,
    email: row?.email || siteConfig.contact.email,
    address: row?.address || siteConfig.contact.address,
    whatsapp: row?.whatsapp || siteConfig.contact.whatsapp,
    instagramUrl: row?.instagramUrl || siteConfig.social.instagram,
    appStoreUrl: row?.appStoreUrl || siteConfig.booking.appStore,
    googlePlayUrl: row?.googlePlayUrl || siteConfig.booking.googlePlay,
  };
}
