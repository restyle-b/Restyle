import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/section-heading";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { Reveal } from "@/components/reveal";
import { BookingLink } from "@/components/booking-link";
import { siteConfig } from "@/lib/config";
import { serviceSlugs } from "@/lib/services-data";

export default function HomePage() {
  const t = useTranslations("home");
  const tServices = useTranslations("servicesData");
  const tRoot = useTranslations();
  const testimonials = tRoot.raw("testimonialsData.items") as { name: string; quote: string }[];
  const hours = tRoot.raw("hours") as { day: string; hours: string }[];
  return (
    <>
      {/*
        Hero: רקע fixed שנשאר "צמוד" למסך בזמן שהתוכן גולש מעליו (בהשראת
        menspire.com) — z-index שלילי כך שהסקציה הבאה (רקע אטום) מכסה אותו
        בטבעיות בזמן הגלילה.
      */}
      <section className="relative flex min-h-[100svh] items-start sm:min-h-[170vh]">
        <div
          className="animate-hero-zoom fixed inset-0 -z-10 bg-cover bg-center"
          style={{ backgroundImage: "url(/images/hero-bg.jpg)" }}
        >
          <div className="absolute inset-0 bg-ink/55" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/90 via-ink/70 to-ink" />
        </div>
        <Container className="relative z-10 py-24 pt-[calc(4rem+6rem)]">
          <p className="animate-fade-up font-display text-sm uppercase tracking-[0.3em] text-accent">
            {t("heroEyebrow")}
          </p>
          <h1 className="animate-fade-up font-display mt-6 max-w-3xl text-4xl font-extrabold leading-tight text-white [animation-delay:120ms] sm:text-6xl">
            {t("heroTitle", { name: siteConfig.name })}
          </h1>
          <p className="animate-fade-up mt-6 max-w-xl text-lg text-neutral-300 [animation-delay:240ms]">
            {t("heroSubtitle")}
          </p>
          <div className="animate-fade-up mt-10 flex flex-wrap gap-4 [animation-delay:360ms]">
            <BookingLink className={buttonVariants({ size: "lg", variant: "light" })}>
              {t("bookingCta")}
            </BookingLink>
            <Link href="/services" className={buttonVariants({ variant: "outline", size: "lg" })}>
              {t("servicesCta")}
            </Link>
          </div>
        </Container>

        {/* חיווי "גלול" — מזמין לגלול מטה (קישוטי, aria-hidden) */}
        <div className="pointer-events-none absolute inset-x-0 top-[86svh] z-10 flex justify-center sm:top-[90svh]">
          <span className="animate-float text-accent/80" aria-hidden="true">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </span>
        </div>
      </section>

      {/* שירותים */}
      <section className="bg-paper py-16 text-ink sm:py-24">
        <Container>
          <Reveal>
            <SectionHeading center eyebrow={t("servicesEyebrow")} title={t("servicesTitle")} />
          </Reveal>
          <div className="mt-16 grid gap-px overflow-hidden border border-line-light sm:grid-cols-2 lg:grid-cols-3">
            {serviceSlugs.map((slug, i) => (
              <Reveal key={slug} delay={i * 70}>
                <div className="h-full border-line-light bg-cream p-8 transition-colors hover:bg-white sm:border-l">
                  <h3 className="font-display text-lg font-bold uppercase tracking-wide">
                    {tServices(`${slug}.name`)}
                  </h3>
                  <p className="mt-3 text-sm text-neutral-600">{tServices(`${slug}.description`)}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-12 flex justify-center">
            <Link href="/services" className={buttonVariants({ variant: "outline" })}>
              {t("allServicesCta")}
            </Link>
          </Reveal>
        </Container>
      </section>

      {/* CTA קביעת תור */}
      <section className="bg-ink py-16 text-center sm:py-24">
        <Container className="flex flex-col items-center">
          <Reveal>
            <p className="font-display text-sm uppercase tracking-[0.3em] text-accent">
              {t("ctaEyebrow")}
            </p>
            <h2 className="font-display mt-3 max-w-xl text-2xl font-bold text-white sm:text-3xl">
              {t("ctaTitle")}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-neutral-300">{t("ctaText")}</p>
          </Reveal>
          <Reveal className="mt-8">
            <BookingLink className={buttonVariants({ size: "lg", variant: "light" })}>
              {t("ctaBooking")}
            </BookingLink>
          </Reveal>
        </Container>
      </section>

      {/* אקדמיה */}
      <section className="bg-paper text-ink">
        <Reveal>
          <ImagePlaceholder label={t("academyImageLabel")} className="aspect-[16/9] sm:aspect-[21/9]" />
        </Reveal>
        <Container className="py-14 sm:py-20">
          <Reveal>
            <SectionHeading
              center
              eyebrow={t("academyEyebrow")}
              title={t("academyTitle")}
              description={t("academyDescription")}
              className="mx-auto"
            />
          </Reveal>
          <Reveal className="mt-8 flex justify-center">
            <Link href="/academy" className={buttonVariants()}>
              {t("allCoursesCta")}
            </Link>
          </Reveal>
        </Container>
      </section>

      {/* אודות תקציר */}
      <section className="bg-ink">
        <Reveal>
          <ImagePlaceholder label={t("aboutImageLabel")} className="aspect-[16/9] sm:aspect-[21/9]" />
        </Reveal>
        <Container className="py-14 sm:py-20">
          <Reveal>
            <SectionHeading
              light
              center
              eyebrow={t("aboutEyebrow")}
              title={t("aboutTitle")}
              description={t("aboutDescription")}
              className="mx-auto"
            />
          </Reveal>
          <Reveal className="mt-8 flex justify-center">
            <Link href="/about" className={buttonVariants({ variant: "outline" })}>
              {t("readMoreCta")}
            </Link>
          </Reveal>
        </Container>
      </section>

      {/* גלריה */}
      <section className="bg-paper py-16 text-ink sm:py-24">
        <Container>
          <Reveal>
            <SectionHeading center eyebrow={t("galleryEyebrow")} title={t("galleryTitle")} />
          </Reveal>
          <div className="mt-16 grid grid-cols-2 gap-px sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Reveal key={i} direction="scale" delay={(i % 4) * 60}>
                <ImagePlaceholder label={t("workImageLabel")} className="aspect-square" />
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-12 flex justify-center">
            <Link href="/gallery" className={buttonVariants({ variant: "outline" })}>
              {t("fullGalleryCta")}
            </Link>
          </Reveal>
        </Container>
      </section>

      {/* המלצות */}
      <section className="bg-ink py-16 sm:py-24">
        <Container>
          <Reveal>
            <SectionHeading center light eyebrow={t("testimonialsEyebrow")} title={t("testimonialsTitle")} />
          </Reveal>
          <div className="mt-16 grid gap-px sm:grid-cols-3">
            {testimonials.map((item, i) => (
              <Reveal key={item.name} delay={i * 80}>
                <figure className="h-full border-t border-line-dark px-6 py-8 text-center">
                  <span className="font-display text-4xl text-accent">&rdquo;</span>
                  <blockquote className="mt-2 text-neutral-300">{item.quote}</blockquote>
                  <figcaption className="mt-4 font-display text-sm font-semibold uppercase tracking-wide text-white">
                    {item.name}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* מיקום ושעות + צור קשר */}
      <section className="bg-paper py-16 text-ink sm:py-24">
        <Container className="grid gap-12 lg:grid-cols-2">
          <Reveal>
            <div>
              <SectionHeading eyebrow={t("locationsEyebrow")} title={t("locationsTitle")} />
              <dl className="mt-8 space-y-3 text-neutral-700">
                <div className="flex gap-3">
                  <dt className="font-medium">{t("addressLabel")}</dt>
                  <dd>{siteConfig.contact.address}</dd>
                </div>
                <div className="flex gap-3">
                  <dt className="font-medium">{t("phoneLabel")}</dt>
                  <dd>{siteConfig.contact.phone}</dd>
                </div>
                <div className="flex gap-3">
                  <dt className="font-medium">{t("hoursLabel")}</dt>
                  <dd>{hours.map((row) => `${row.day} ${row.hours}`).join(", ")}</dd>
                </div>
              </dl>
              <Link href="/locations" className={buttonVariants({ variant: "outline", className: "mt-8" })}>
                {t("directionsCta")}
              </Link>
            </div>
          </Reveal>
          <Reveal>
            <div>
              <SectionHeading eyebrow={t("contactEyebrow")} title={t("contactTitle")} />
              <Link href="/contact" className={buttonVariants({ className: "mt-8" })}>
                {t("contactPageCta")}
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
