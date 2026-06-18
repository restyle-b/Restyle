/**
 * תצורת אתר ReStyle.
 * קביעת תור מתבצעת באפליקציית ReStyle — הקישורים כאן מפנים אליה.
 */
export const siteConfig = {
  name: "ReStyle",
  description: "מספרת ReStyle — תספורת, עיצוב שיער ואקדמיה מקצועית.",
  url: "https://restyle.co.il",

  /** קישורי קביעת תור — אפליקציית ReStyle */
  booking: {
    appStore: "https://apps.apple.com/il/app/restyle/id6744821132?l=he",
    googlePlay: "https://play.google.com/store/apps/details?id=com.smtio.restyle",
  },

  social: {
    instagram: "#",
    facebook: "#",
    whatsapp: "#",
  },

  contact: {
    phone: "050-5961800",
    email: "Restyle.Barbershop@outlook.com",
    address: "חיים לסקוב 4, תל אביב",
    /** מספר ל-wa.me — בפורמט בינלאומי בלי + ובלי 0 מוביל */
    whatsapp: "972505961800",
  },

  /** שעות פעילות — מקור אמת יחיד (דף בית + עמוד מיקום) */
  hours: [
    { day: "ראשון–חמישי", hours: "09:00–20:00" },
    { day: "שישי", hours: "09:00–14:00" },
    { day: "שבת", hours: "סגור" },
  ],

  /** פרטי נגישות — לעמוד הצהרת הנגישות (חובה לפי תקנות שוויון זכויות) */
  accessibility: {
    coordinatorName: "צוות ReStyle",
    phone: "050-5961800",
    email: "Restyle.Barbershop@outlook.com",
    lastUpdated: "18 ביוני 2026",
  },
} as const;

/** פריטי הניווט הראשי (ראה docs/DESIGN.md). */
export const navLinks = [
  { href: "/about", label: "אודות" },
  { href: "/services", label: "שירותים" },
  { href: "/academy", label: "אקדמיה" },
  { href: "/gallery", label: "גלריה" },
  { href: "/locations", label: "מיקום ושעות" },
  { href: "/contact", label: "צור קשר" },
] as const;
