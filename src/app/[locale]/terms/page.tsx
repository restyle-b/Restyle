import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
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
  const t = await getTranslations({ locale, namespace: "terms" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default function TermsPage() {
  const t = useTranslations("terms");
  return (
    <Container className="py-20">
      <SectionHeading light eyebrow={t("eyebrow")} title={t("title")} />

      <div className="mt-10 max-w-3xl space-y-8 text-neutral-300">
        <p>{t("intro")}</p>

        <section>
          <h2 className="font-display text-xl font-bold text-white">{t("natureHeading")}</h2>
          <p className="mt-3">{t("natureBody")}</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-white">{t("contentHeading")}</h2>
          <p className="mt-3">{t("contentBody")}</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-white">{t("ipHeading")}</h2>
          <p className="mt-3">{t("ipBody")}</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-white">{t("privacyHeading")}</h2>
          <p className="mt-3">
            {t("privacyBodyBefore")}{" "}
            <Link href="/privacy" className="text-accent underline underline-offset-2">
              {t("privacyLink")}
            </Link>{" "}
            {t("privacyBodyAfter")}
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-white">{t("contactHeading")}</h2>
          <p className="mt-3">
            {t("contactBodyBefore")}{" "}
            <a href={`tel:${siteConfig.contact.phone}`} className="hover:text-accent">
              {siteConfig.contact.phone}
            </a>{" "}
            {t("contactBodyMiddle")}{" "}
            <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-accent">
              {siteConfig.contact.email}
            </a>
            .
          </p>
        </section>

        <p className="text-sm text-neutral-500">{t("updatedText", { date: siteConfig.lastUpdated })}</p>
      </div>
    </Container>
  );
}
