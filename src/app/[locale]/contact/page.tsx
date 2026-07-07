import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/section-heading";
import { ContactForm } from "@/components/contact-form";
import { ContactActions } from "@/components/contact-actions";
import { getSiteContactInfo } from "@/lib/content/get-site-settings";
import type { Locale } from "@/i18n/routing";

export const dynamic = "force-static";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  const t = await getTranslations({ locale, namespace: "contact" });
  const contact = await getSiteContactInfo();
  return (
    <Container className="py-20">
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <SectionHeading light eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
          <dl className="mt-8 space-y-3 text-neutral-300">
            <div className="flex gap-3">
              <dt className="font-medium text-white">{t("addressLabel")}</dt>
              <dd>{contact.address || t("comingSoon")}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="font-medium text-white">{t("phoneLabel")}</dt>
              <dd>{contact.phone || t("comingSoon")}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="font-medium text-white">{t("emailLabel")}</dt>
              <dd>{contact.email || t("comingSoon")}</dd>
            </div>
          </dl>

          <ContactActions className="mt-8" locale={locale} contact={contact} />
        </div>

        <ContactForm />
      </div>
    </Container>
  );
}
