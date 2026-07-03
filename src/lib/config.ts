/**
 * תצורת אתר ReStyle.
 * קביעת תור מתבצעת באפליקציית ReStyle — הקישורים כאן מפנים אליה.
 */
export const siteConfig = {
  name: "ReStyle",
  url: "https://restyle.co.il",

  /** קישורי קביעת תור — אפליקציית ReStyle */
  booking: {
    appStore: "https://apps.apple.com/il/app/restyle/id6744821132?l=he",
    googlePlay: "https://play.google.com/store/apps/details?id=com.smtio.restyle",
  },

  social: {
    instagram: "https://www.instagram.com/avraham.hairartist",
    facebook: "#",
    whatsapp: "#",
  },

  contact: {
    phone: "050-5961800",
    email: "Restyle.Barbershop@outlook.com",
    address: "לסקוב 4, תל אביב",
    /** מספר ל-wa.me — בפורמט בינלאומי בלי + ובלי 0 מוביל */
    whatsapp: "972505961800",
  },

  /** תאריך עדכון אחרון — לעמודי הצהרת נגישות/פרטיות/תקנון (תאריך אינו טעון תרגום) */
  lastUpdated: "18.06.2026",
} as const;

/** מפתחות פריטי הניווט הראשי — התוויות מגיעות מ-messages.nav (ראה docs/DESIGN.md). */
export const navLinks = [
  { href: "/about", key: "about" },
  { href: "/services", key: "services" },
  { href: "/shop", key: "shop" },
  { href: "/academy", key: "academy" },
  { href: "/gallery", key: "gallery" },
  { href: "/locations", key: "locations" },
  { href: "/contact", key: "contact" },
] as const;
