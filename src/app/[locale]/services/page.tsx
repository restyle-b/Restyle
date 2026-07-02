import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { BookingLink } from "@/components/booking-link";
import { getServices } from "@/lib/content/get-services";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "services" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "services" });
  const services = await getServices(locale);
  return (
    <Container className="py-20">
      <SectionHeading as="h1" light eyebrow={t("eyebrow")} title={t("title")} />

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <div key={service.slug} className="rounded-lg border border-line-dark bg-ink-soft p-6">
            <h2 className="font-display text-lg font-bold text-white">{service.name}</h2>
            <p className="mt-2 text-sm text-neutral-400">{service.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <BookingLink className={buttonVariants({ size: "lg", variant: "light" })}>{t("bookingCta")}</BookingLink>
      </div>
    </Container>
  );
}
