import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { BookingLink } from "@/components/booking-link";
import { serviceSlugs } from "@/lib/services-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "services" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default function ServicesPage() {
  const t = useTranslations("services");
  const tServices = useTranslations("servicesData");
  return (
    <Container className="py-20">
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {serviceSlugs.map((slug) => (
          <div key={slug} className="rounded-lg border border-line-dark bg-ink-soft p-6">
            <h2 className="font-display text-lg font-bold text-white">{tServices(`${slug}.name`)}</h2>
            <p className="mt-2 text-sm text-neutral-400">{tServices(`${slug}.description`)}</p>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <BookingLink className={buttonVariants({ size: "lg" })}>{t("bookingCta")}</BookingLink>
      </div>
    </Container>
  );
}
