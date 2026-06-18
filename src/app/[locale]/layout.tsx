import type { Metadata } from "next";
import { Assistant, Frank_Ruhl_Libre, Cairo, El_Messiri } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { siteConfig } from "@/lib/config";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SkipToContent } from "@/components/skip-to-content";
import { AccessibilityMenu } from "@/components/accessibility/accessibility-menu";
import { FloatingContact } from "@/components/floating-contact";
import "../globals.css";

/** כותרות עברית/אנגלית — סריף פרימיום עם נוכחות עיתונאית. */
const frankRuhlLibre = Frank_Ruhl_Libre({
  subsets: ["hebrew", "latin"],
  weight: ["500", "700", "900"],
  variable: "--font-heading-latin",
});

/** טקסט רץ עברית/אנגלית. */
const assistant = Assistant({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body-latin",
});

/** כותרות ערבית — סריף-דיספליי עם אופי תואם. */
const elMessiri = El_Messiri({
  subsets: ["arabic", "latin"],
  weight: ["500", "600", "700"],
  variable: "--font-heading-arabic",
});

/** טקסט רץ ערבית. */
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body-arabic",
});

const OG_LOCALES: Record<Locale, string> = {
  he: "he_IL",
  en: "en_US",
  ar: "ar",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

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

  return (
    <html
      lang={locale}
      dir={locale === "en" ? "ltr" : "rtl"}
      className={`${frankRuhlLibre.variable} ${assistant.variable} ${elMessiri.variable} ${cairo.variable}`}
    >
      <body className="flex min-h-screen flex-col">
        <NextIntlClientProvider>
          <SkipToContent />
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
          <FloatingContact />
          <AccessibilityMenu />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
