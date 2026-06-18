import { siteConfig } from "@/lib/config";

/**
 * מקור אמת יחיד לקישורי יצירת קשר (טלפון / וואטסאפ / וייז / מפה).
 * נבנים מ-siteConfig כדי שעדכון פרטים יתעדכן בכל האתר.
 */

const WHATSAPP_MESSAGE = "היי! אשמח לקבל פרטים על Restyle.";

export const contactLinks = {
  /** חיוג ישיר */
  tel: `tel:${siteConfig.contact.phone}`,
  /** פתיחת צ'אט וואטסאפ עם הודעה מוכנה */
  whatsapp: `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(
    WHATSAPP_MESSAGE,
  )}`,
  /** ניווט בוייז לפי הכתובת */
  waze: `https://waze.com/ul?q=${encodeURIComponent(siteConfig.contact.address)}&navigate=yes`,
  /** הטמעת מפת Google (iframe) */
  mapEmbed: `https://maps.google.com/maps?q=${encodeURIComponent(
    siteConfig.contact.address,
  )}&hl=he&z=16&output=embed`,
} as const;
