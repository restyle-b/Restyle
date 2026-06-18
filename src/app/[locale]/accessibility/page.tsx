import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/section-heading";
import { siteConfig } from "@/lib/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "accessibility" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default function AccessibilityPage() {
  const t = useTranslations("accessibility");
  const items = t.raw("items") as string[];
  const { phone, email } = siteConfig.contact;

  return (
    <Container className="py-20">
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />

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
