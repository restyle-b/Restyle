import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/section-heading";
import { siteConfig } from "@/lib/config";
import { getSiteContactInfo } from "@/lib/content/get-site-settings";

export const dynamic = "force-static";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "accessibility" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function AccessibilityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "accessibility" });
  const items = t.raw("items") as string[];
  const { phone, email } = await getSiteContactInfo();

  return (
    <Container className="py-20">
      <SectionHeading as="h1" light eyebrow={t("eyebrow")} title={t("title")} />

      <div className="mt-10 max-w-3xl space-y-8 text-neutral-300">
        <p>{t("intro")}</p>

        <section>
          <h2 className="font-display text-xl font-bold text-white">{t("levelHeading")}</h2>
          <p className="mt-3">{t("levelBody")}</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-white">{t("accommodationsHeading")}</h2>
          <ul className="mt-3 list-disc space-y-2 pr-5">
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-white">{t("limitationsHeading")}</h2>
          <p className="mt-3">{t("limitationsBody")}</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold text-white">{t("contactHeading")}</h2>
          <p className="mt-3">{t("contactIntro")}</p>
          <dl className="mt-4 space-y-2">
            <div className="flex gap-3">
              <dt className="font-medium text-white">{t("nameLabel")}</dt>
              <dd>{t("coordinatorName")}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="font-medium text-white">{t("phoneLabel")}</dt>
              <dd>
                <a href={`tel:${phone}`} className="hover:text-accent">
                  {phone}
                </a>
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="font-medium text-white">{t("emailLabel")}</dt>
              <dd>
                <a href={`mailto:${email}`} className="hover:text-accent">
                  {email}
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
