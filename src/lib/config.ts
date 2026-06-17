/**
 * תצורת אתר Restyle.
 * קביעת תור מתבצעת באפליקציית Restyle — הקישורים כאן מפנים אליה.
 * החלף ב-URLs האמיתיים כשהאפליקציה תהיה זמינה (ראה docs/SETUP.md).
 */
export const siteConfig = {
  name: "Restyle",
  description: "מספרת Restyle — תספורת, עיצוב, אקדמיה ומוצרי טיפוח פרימיום.",
  url: "https://restyle.co.il",

  /** קישורי קביעת תור — אפליקציית Restyle */
  booking: {
    appStore: "#", // TODO: קישור App Store
    googlePlay: "#", // TODO: קישור Google Play
    web: "#", // TODO: קישור web לקביעת תור (אם קיים)
  },

  social: {
    instagram: "#",
    facebook: "#",
    whatsapp: "#",
  },

  contact: {
    phone: "",
    email: "",
    address: "",
  },
} as const;

/** פריטי הניווט הראשי (ראה docs/DESIGN.md). */
export const navLinks = [
  { href: "/about", label: "אודות" },
  { href: "/services", label: "שירותים" },
  { href: "/academy", label: "אקדמיה" },
  { href: "/shop", label: "חנות" },
  { href: "/locations", label: "מיקום ושעות" },
  { href: "/contact", label: "צור קשר" },
] as const;
