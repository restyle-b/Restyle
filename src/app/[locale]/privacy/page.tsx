import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/section-heading";
import { siteConfig } from "@/lib/config";

export const dynamic = "force-static";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default function PrivacyPage() {
  const t = useTranslations("privacy");
  return (
    <Container className="py-20">
      <SectionHeading light eyebrow={t("eyebrow")} title={t("title")} />

      <div className="mt-10 max-w-3xl space-y-8 text-neutral-300">
        <p>{t("intro")}</p>

        <section>
          <h2 className="font-display text-xl font-bold text-white">{t("dataCollectedHeading")}</h2>
          <p className="mt-3">{t("dataCollectedBody")}</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-white">{t("dataUseHeading")}</h2>
          <p className="mt-3">{t("dataUseBody")}</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-white">{t("dataSharingHeading")}</h2>
          <p className="mt-3">{t("dataSharingBody")}</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-white">{t("cookiesHeading")}</h2>
          <p className="mt-3">{t("cookiesBody")}</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-white">{t("securityHeading")}</h2>
          <p className="mt-3">{t("securityBody")}</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-white">{t("rightsHeading")}</h2>
          <p className="mt-3">{t("rightsBody")}</p>
          <dl className="mt-4 space-y-2">
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
        </section>

        <p className="text-sm text-neutral-500">{t("updatedText", { date: siteConfig.lastUpdated })}</p>
      </div>
    </Container>
  );
}
