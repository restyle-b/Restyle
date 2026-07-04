import type { Metadata, Viewport } from "next";
import { Assistant, Cairo } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { siteConfig } from "@/lib/config";
import { SiteHeader } from "@/components/site-header";
import { ScrollProgress } from "@/components/scroll-progress";
import { SiteFooter } from "@/components/site-footer";
import { SkipToContent } from "@/components/skip-to-content";
import { AccessibilityMenu } from "@/components/accessibility/accessibility-menu";
import { FloatingContact } from "@/components/floating-contact";
import { CartProvider } from "@/lib/cart/cart-context";
import { getSiteContactInfo } from "@/lib/content/get-site-settings";
import "../globals.css";

/**
 * טיפוגרפיה עברית/אנגלית — Assistant לכותרות ולטקסט הרץ כאחד (מינימליסטי-נקי,
 * בהשראת אור חיון). הבחנה נעשית במשקל ובגודל, לא בהחלפת משפחת גופן.
 */
const assistant = Assistant({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-latin",
});

/** טיפוגרפיה ערבית — Cairo לכותרות ולטקסט הרץ. */
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-arabic",
});

const OG_LOCALES: Record<Locale, string> = {
  he: "he_IL",
  en: "en_US",
  ar: "ar",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0e0e0e" },
    { media: "(prefers-color-scheme: light)", color: "#fafaf8" },
  ],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "layout" });

  return {
    title: {
      default: t("title"),
      template: `%s | ${siteConfig.name}`,
    },
    description: t("description"),
    openGraph: {
      title: siteConfig.name,
      description: t("description"),
      type: "website",
      locale: OG_LOCALES[locale as Locale] ?? OG_LOCALES[routing.defaultLocale],
    },
    // PWA — אפליקציה נפרדת מהאדמין (שני עצי <html> עצמאיים, ראה docs/features/pwa.md).
    manifest: "/site.webmanifest",
    appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: siteConfig.name },
    icons: { apple: "/icons/site-apple-touch.png" },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const contact = await getSiteContactInfo();

  return (
    <html
      lang={locale}
      dir={locale === "en" ? "ltr" : "rtl"}
      className={`${assistant.variable} ${cairo.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        {/* קביעת מצב יום/לילה לפני ה-paint הראשון — מונע "הבזק" של מצב שגוי.
            ברירת מחדל לפי הגדרת המכשיר (prefers-color-scheme), עם override ידני מ-localStorage. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t!=='day'&&t!=='night'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'night':'day';}document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='night';}})();`,
          }}
        />
        <NextIntlClientProvider>
          <CartProvider>
            <SkipToContent />
            <ScrollProgress />
            <SiteHeader appStoreUrl={contact.appStoreUrl} googlePlayUrl={contact.googlePlayUrl} />
            <main id="main" className="flex-1">
              {children}
            </main>
            <SiteFooter locale={locale as Locale} contact={contact} />
            <FloatingContact locale={locale as Locale} contact={contact} />
            <AccessibilityMenu />
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
