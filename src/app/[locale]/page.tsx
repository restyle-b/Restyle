import Image from "next/image";
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
          <div className="bg-ink/55 absolute inset-0" />
          <div className="from-ink/90 via-ink/70 to-ink absolute inset-0 bg-gradient-to-b" />
        </div>
        <Container className="relative z-10 py-24 pt-[calc(4rem+6rem)]">
          <p className="animate-fade-up font-display text-accent text-sm tracking-[0.3em] uppercase">
            {t("heroEyebrow")}
          </p>
          <h1 className="animate-fade-up font-display mt-6 max-w-3xl text-4xl leading-tight font-extrabold text-white [animation-delay:120ms] sm:text-6xl">
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

        {/* חיווי "גלול" — מספריים של ספר שנוסנות ומצביעות מטה (קישוטי, aria-hidden) */}
        <div className="pointer-events-none absolute inset-x-0 top-[86svh] z-10 flex justify-center sm:top-[90svh]">
          <span className="text-accent/80" aria-hidden="true">
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <g className="scissors-blade scissors-blade-r">
                <circle cx="16" cy="5" r="2.6" />
                <path d="M12 10 14 21" />
              </g>
              <g className="scissors-blade scissors-blade-l">
                <circle cx="8" cy="5" r="2.6" />
                <path d="M12 10 10 21" />
              </g>
              <circle cx="12" cy="10" r="0.9" fill="currentColor" stroke="none" />
            </svg>
          </span>
        </div>
      </section>

      {/* שירותים */}
      <section className="bg-paper text-ink py-16 sm:py-24">
        <Container>
          <Reveal>
            <SectionHeading center eyebrow={t("servicesEyebrow")} title={t("servicesTitle")} />
          </Reveal>
          <div className="border-line-light mt-16 grid gap-px overflow-hidden border sm:grid-cols-2 lg:grid-cols-3">
            {serviceSlugs.map((slug, i) => (
              <Reveal key={slug} delay={i * 70}>
                <div className="border-line-light bg-cream h-full p-8 transition-colors hover:bg-white sm:border-l">
                  <h3 className="font-display text-lg font-bold tracking-wide uppercase">
                    {tServices(`${slug}.name`)}
                  </h3>
                  <p className="mt-3 text-sm text-neutral-600">
                    {tServices(`${slug}.description`)}
                  </p>
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
      <section className="bg-ink relative overflow-hidden py-16 text-center sm:py-24">
        <div className="glow-orb inset-x-0 -top-24 mx-auto h-72 w-72" aria-hidden="true" />
        <Container className="relative flex flex-col items-center">
          <Reveal>
            <p className="font-display text-accent text-sm tracking-[0.3em] uppercase">
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
          <ImagePlaceholder
            label={t("academyImageLabel")}
            className="aspect-[16/9] sm:aspect-[21/9]"
          />
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
          <div className="relative aspect-[16/9] overflow-hidden sm:aspect-[21/9]">
            <Image
              src="/images/gallery-studio-1.jpg"
              alt={t("aboutImageLabel")}
              fill
              sizes="100vw"
              className="object-cover"
            />
            {/* קווי הדגשה זוהרים לפרטי הסטודיו — סטייל feature-callout, מוסתר במובייל כדי לא להעמיס */}
            <div className="pointer-events-none absolute inset-0 hidden sm:block">
              <span className="feature-glow-dot start-[68%] top-[22%]" />
              <span className="feature-glow-line start-[68%] top-[22%] w-16 -translate-y-1/2 rtl:-scale-x-100" />
              <span className="font-display absolute start-[calc(68%+4.5rem)] top-[22%] -translate-y-1/2 text-xs tracking-wide whitespace-nowrap text-white/90 uppercase">
                {t("studioFeatureLighting")}
              </span>

              <span className="feature-glow-dot start-[28%] top-[62%]" />
              <span className="feature-glow-line start-[28%] top-[62%] w-16 -translate-y-1/2 rtl:-scale-x-100" />
              <span className="font-display absolute start-[calc(28%+4.5rem)] top-[62%] -translate-y-1/2 text-xs tracking-wide whitespace-nowrap text-white/90 uppercase">
                {t("studioFeatureChairs")}
              </span>

              <span className="feature-glow-dot start-[48%] top-[40%]" />
              <span className="feature-glow-line start-[48%] top-[40%] w-16 -translate-y-1/2 rtl:-scale-x-100" />
              <span className="font-display absolute start-[calc(48%+4.5rem)] top-[40%] -translate-y-1/2 text-xs tracking-wide whitespace-nowrap text-white/90 uppercase">
                {t("studioFeatureDesign")}
              </span>
            </div>
          </div>
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
      <section className="bg-paper text-ink py-16 sm:py-24">
        <Container>
          <Reveal>
            <SectionHeading center eyebrow={t("galleryEyebrow")} title={t("galleryTitle")} />
          </Reveal>
          <div className="mt-16 grid grid-cols-2 gap-px sm:grid-cols-4">
            <Reveal direction="scale">
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src="/images/gallery-studio-1.jpg"
                  alt={t("studioImageLabel")}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
            {Array.from({ length: 7 }).map((_, i) => (
              <Reveal key={i} direction="scale" delay={((i + 1) % 4) * 60}>
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
      <section className="bg-ink relative overflow-hidden py-16 sm:py-24">
        <div className="glow-orb inset-x-0 -bottom-32 mx-auto h-96 w-96" aria-hidden="true" />
        <Container className="relative">
          <Reveal>
            <SectionHeading
              center
              light
              eyebrow={t("testimonialsEyebrow")}
              title={t("testimonialsTitle")}
            />
          </Reveal>
          <div className="mt-16 grid gap-px sm:grid-cols-3">
            {testimonials.map((item, i) => (
              <Reveal key={item.name} delay={i * 80}>
                <figure className="border-line-dark h-full border-t px-6 py-8 text-center">
                  <span className="font-display text-accent text-4xl">&rdquo;</span>
                  <blockquote className="mt-2 text-neutral-300">{item.quote}</blockquote>
                  <figcaption className="font-display mt-4 text-sm font-semibold tracking-wide text-white uppercase">
                    {item.name}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* מיקום ושעות + צור קשר */}
      <section className="bg-paper text-ink py-16 sm:py-24">
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
              <Link
                href="/locations"
                className={buttonVariants({ variant: "outline", className: "mt-8" })}
              >
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
