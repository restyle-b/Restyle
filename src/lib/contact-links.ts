import type { Locale } from "@/i18n/routing";

/**
 * מקור אמת יחיד לקישורי יצירת קשר (טלפון / וואטסאפ / וייז / מפה).
 * נבנים מ-contact (SiteSettings דרך getSiteContactInfo, עם נפילה ל-siteConfig)
 * שמועבר מהקורא — כך שעדכון פרטים באדמין יתעדכן בכל האתר.
 */
export function getContactLinks(
  whatsappMessage: string,
  locale: Locale,
  contact: { phone: string; whatsapp: string; address: string },
) {
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
