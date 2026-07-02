import type { Locale } from "@/i18n/routing";

export type ContactLinksInfo = { phone: string; whatsapp: string; address: string };

/**
 * מקור אמת יחיד לקישורי יצירת קשר (טלפון / וואטסאפ / וייז / מפה).
 * מקבל את פרטי הקשר כפרמטר (במקום לייבא siteConfig ישירות) — כך שהקוראים
 * יכולים למשוך אותם מ-SiteSettings (DB) עם fallback סטטי, ראה get-site-settings.ts.
 */
export function getContactLinks(whatsappMessage: string, locale: Locale, contact: ContactLinksInfo) {
  return {
    /** חיוג ישיר */
    tel: `tel:${contact.phone}`,
    /** פתיחת צ'אט וואטסאפ עם הודעה מוכנה */
    whatsapp: `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`,
    /** ניווט בוייז לפי הכתובת */
    waze: `https://waze.com/ul?q=${encodeURIComponent(contact.address)}&navigate=yes`,
    /** הטמעת מפת Google (iframe) */
    mapEmbed: `https://maps.google.com/maps?q=${encodeURIComponent(
      contact.address,
    )}&hl=${locale}&z=16&output=embed`,
  } as const;
}
