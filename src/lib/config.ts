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
    appStore: "https://apps.apple.com/il/app/restyle/id6744821132?l=he",
    googlePlay: "https://play.google.com/store/apps/details?id=com.smtio.restyle",
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
