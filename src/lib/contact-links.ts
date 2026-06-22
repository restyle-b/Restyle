import { siteConfig } from "@/lib/config";
import type { Locale } from "@/i18n/routing";

/**
 * מקור אמת יחיד לקישורי יצירת קשר (טלפון / וואטסאפ / וייז / מפה).
 * נבנים מ-siteConfig כדי שעדכון פרטים יתעדכן בכל האתר.
 */
export function getContactLinks(whatsappMessage: string, locale: Locale) {
  return {
    /** חיוג ישיר */
    tel: `tel:${siteConfig.contact.phone}`,
    /** פתיחת צ'אט וואטסאפ עם הודעה מוכנה */
    whatsapp: `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(
      whatsappMessage,
    )}`,
    /** ניווט בוייז לפי הכתובת */
    waze: `https://waze.com/ul?q=${encodeURIComponent(siteConfig.contact.address)}&navigate=yes`,
    /** הטמעת מפת Google (iframe) */
    mapEmbed: `https://maps.google.com/maps?q=${encodeURIComponent(
      siteConfig.contact.address,
    )}&hl=${locale}&z=16&output=embed`,
  } as const;
}
