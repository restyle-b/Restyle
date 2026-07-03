import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { BookingLink } from "@/components/booking-link";
import { OpenNowBadge } from "@/components/locations/open-now-badge";
import { ContactTiles } from "@/components/locations/contact-tiles";
import { getContactLinks } from "@/lib/contact-links";
import { siteConfig } from "@/lib/config";
import type { Locale } from "@/i18n/routing";

export const dynamic = "force-static";

/** מציג "@handle" מתוך URL של אינסטגרם; נופל בחזרה ל-URL הגולמי אם לא ניתן לפרש. */
function instagramHandle(url: string): string {
  try {
    const path = new URL(url).pathname.replace(/\//g, "");
    return path ? `@${path}` : url;
  } catch {
    return url;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "locations" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription", { address: siteConfig.contact.address }),
  };
}

export default async function LocationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  const t = await getTranslations({ locale, namespace: "locations" });
  const tActions = await getTranslations({ locale, namespace: "contactActions" });
  const tRoot = await getTranslations({ locale });
  const hours = tRoot.raw("hours") as { day: string; hours: string }[];
  const contactLinks = getContactLinks(tActions("whatsappMessage"), locale);

  return (
    <Container className="py-20">
      <SectionHeading light eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />

      <div className="mt-12 grid items-start gap-12 lg:grid-cols-2">
        <div className="space-y-8 text-neutral-300">
          <div>
            <h2 className="font-display text-lg font-bold text-white">{t("addressHeading")}</h2>
            <p className="mt-2">{siteConfig.contact.address}</p>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold text-white">{t("hoursHeading")}</h2>
            <dl className="mt-3 max-w-[380px] space-y-2">
              {hours.map((row) => (
                <div
                  key={row.day}
                  className="flex justify-between gap-6 border-b border-dashed border-line-dark pb-2 text-[15px]"
                >
                  <dt className="font-semibold text-white">{row.day}</dt>
                  <dd className="text-neutral-300 [direction:ltr] [font-variant-numeric:tabular-nums]">
                    {row.hours}
                  </dd>
                </div>
              ))}
            </dl>
            <OpenNowBadge label={t("openNow")} />
          </div>

          <div>
            <h2 className="font-display text-lg font-bold text-white">{t("contactHeading")}</h2>
            <dl className="mt-3 space-y-2">
              <div className="flex gap-3">
                <dt className="font-medium text-white">{t("phoneLabel")}</dt>
                <dd>
                  <a href={`tel:${siteConfig.contact.phone}`} className="hover:text-accent">
                    {siteConfig.contact.phone}
                  </a>
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="font-medium text-white">{t("emailLabel")}</dt>
                <dd>
                  <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-accent">
                    {siteConfig.contact.email}
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold text-white">{t("quickContactHeading")}</h2>
            <div className="mt-3">
              <ContactTiles
                tel={{ href: contactLinks.tel, sub: siteConfig.contact.phone }}
                whatsapp={{ href: contactLinks.whatsapp, sub: t("tileWhatsappSub") }}
                waze={{ href: contactLinks.waze, sub: siteConfig.contact.address }}
                instagram={{
                  href: siteConfig.social.instagram,
                  sub: instagramHandle(siteConfig.social.instagram),
                }}
                labels={{
                  call: tActions("call"),
                  whatsapp: tActions("whatsapp"),
                  waze: tActions("waze"),
                  instagram: tActions("instagram"),
                }}
              />
            </div>
          </div>

          <BookingLink className={buttonVariants({ size: "lg", variant: "light" })}>{t("bookingCta")}</BookingLink>
        </div>

        <div className="overflow-hidden rounded-lg border border-line-dark">
          <iframe
            src={contactLinks.mapEmbed}
            title={t("mapTitle", { address: siteConfig.contact.address })}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            sandbox="allow-scripts allow-same-origin allow-popups"
            className="h-[420px] w-full"
          />
        </div>
      </div>
    </Container>
  );
}
