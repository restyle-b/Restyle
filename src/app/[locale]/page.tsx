import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/section-heading";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { Reveal } from "@/components/reveal";
import { BookingLink } from "@/components/booking-link";
import { ScissorsScrollIndicator } from "@/components/scissors-scroll-indicator";
import { CutLineDivider } from "@/components/cut-line-divider";
import { ProductCard } from "@/components/shop/product-card";
import { siteConfig } from "@/lib/config";
import { getTestimonials } from "@/lib/content/get-testimonials";
import { getGalleryImages } from "@/lib/content/get-gallery";
import { getProducts } from "@/lib/content/get-products";
import { getOpeningHours } from "@/lib/content/get-opening-hours";
import { getSiteContactInfo } from "@/lib/content/get-site-settings";
import { cn } from "@/lib/utils";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  const hours = await getOpeningHours(locale);
  const contact = await getSiteContactInfo();
  const testimonials = await getTestimonials(locale);
  const galleryImages = await getGalleryImages(locale);
  const featuredProducts = (await getProducts(locale)).slice(0, 4);
  return (
    <>
      {/*
        Hero: רקע fixed שנשאר "צמוד" למסך בזמן שהתוכן גולש מעליו (בהשראת
        menspire.com) — z-index שלילי כך שהסקציה הבאה (רקע אטום) מכסה אותו
        בטבעיות בזמן הגלילה.
      */}
      <section className="relative flex min-h-[100svh] items-start sm:min-h-[170vh]">
        <div className="fixed inset-0 -z-10">
          <div
            className="animate-hero-zoom hero-img absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url(/images/hero-bg.jpg)" }}
          />
          {/* overlay מתחלף יום/לילה (CSS var) — שומר על קריאות הטקסט בשני המצבים */}
          <div className="hero-overlay absolute inset-0" />
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
            <BookingLink
              className={buttonVariants({ size: "lg", variant: "light" })}
              appStoreUrl={contact.appStoreUrl}
              googlePlayUrl={contact.googlePlayUrl}
            >
              {t("bookingCta")}
            </BookingLink>
            <Link href="/shop" className={buttonVariants({ variant: "outline", size: "lg" })}>
              {t("shopCta")}
            </Link>
          </div>
        </Container>

        {/* חיווי "גלול" — מספריים של ספר: כמה סבבי כניסה, ואז נסניס בלופ; לחיצה מסבבת וגוללת לסקציה הבאה */}
        <div className="absolute inset-x-0 top-[86svh] z-10 flex justify-center sm:top-[88svh]">
          <ScissorsScrollIndicator label={t("scrollDownLabel")} scrollTargetId="home-cta" />
        </div>
      </section>

      {/* CTA קביעת תור */}
      <section id="home-cta" className="bg-ink relative overflow-hidden py-16 text-center sm:py-24">
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
            <BookingLink
              className={buttonVariants({ size: "lg", variant: "light" })}
              appStoreUrl={contact.appStoreUrl}
              googlePlayUrl={contact.googlePlayUrl}
            >
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
              cut
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

      {/* חנות — מוצרים נבחרים (מוצג רק כשיש מוצרים; קטלוג ריק מסתיר את הסקציה) */}
      {featuredProducts.length > 0 && (
        <section className="bg-ink relative overflow-hidden py-16 sm:py-24">
          <div className="glow-orb inset-x-0 -top-24 mx-auto h-72 w-72" aria-hidden="true" />
          <Container className="relative">
            <Reveal>
              <SectionHeading
                center
                light
                cut
                eyebrow={t("shopEyebrow")}
                title={t("shopTitle")}
                description={t("shopDescription")}
                className="mx-auto"
              />
            </Reveal>
            <CutLineDivider tone="dark" className="mx-auto mt-10 max-w-md" />
            <div className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-4">
              {featuredProducts.map((product, i) => (
                <Reveal key={product.id} delay={i * 70}>
                  <ProductCard product={product} locale={locale} outOfStockLabel={t("shopOutOfStock")} />
                </Reveal>
              ))}
            </div>
            <Reveal className="mt-12 flex justify-center">
              <Link href="/shop" className={buttonVariants({ size: "lg", variant: "light" })}>
                {t("shopCta")}
              </Link>
            </Reveal>
          </Container>
        </section>
      )}

      {/* אודות תקציר */}
      <section className="bg-ink">
        <Reveal>
          <div className="relative aspect-[16/9] overflow-hidden sm:aspect-[21/9]">
            <Image
              src="/images/gallery-studio-1.jpg"
              alt={t("aboutImageLabel")}
              fill
              sizes="100vw"
              className="object-cover content-img"
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
              cut
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
            <SectionHeading center cut eyebrow={t("galleryEyebrow")} title={t("galleryTitle")} />
          </Reveal>
          <div className="mt-16 grid grid-cols-2 gap-px sm:grid-cols-4">
            <Reveal direction="scale">
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src="/images/gallery-studio-1.jpg"
                  alt={t("studioImageLabel")}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover content-img"
                />
              </div>
            </Reveal>
            {galleryImages.length > 0
              ? galleryImages.slice(0, 7).map((image, i) => (
                  <Reveal key={image.id} direction="scale" delay={((i + 1) % 4) * 60}>
                    <div className="relative aspect-square overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element -- כתובת חיצונית
                          שמוזנת ע"י Admin; אין remotePatterns ל-next/image (מניעת SSRF). */}
                      <img
                        src={image.imageUrl}
                        alt={image.alt}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover content-img"
                      />
                    </div>
                  </Reveal>
                ))
              : Array.from({ length: 7 }).map((_, i) => (
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
              cut
              eyebrow={t("testimonialsEyebrow")}
              title={t("testimonialsTitle")}
            />
          </Reveal>
          {/* פריסה א-סימטרית — ציטוט מוביל גדול + שני ציטוטים תומכים קטנים,
              במקום 3 עמודות שוות-משקל (לחיזוק ה-social proof). */}
          <div className="mt-10 grid items-start gap-12 md:grid-cols-[1.5fr_1fr]">
            {testimonials[0] && (
              <Reveal>
                <figure className="border-cream border-s-2 ps-7">
                  <blockquote className="font-display text-[clamp(1.4rem,2.4vw,1.9rem)] leading-snug font-semibold text-white">
                    &rdquo;{testimonials[0].quote}&rdquo;
                  </blockquote>
                  <figcaption className="text-accent-soft mt-5 text-[13.5px] tracking-[0.12em] uppercase">
                    {testimonials[0].name}
                    {testimonials[0].role && ` · ${testimonials[0].role}`}
                  </figcaption>
                </figure>
              </Reveal>
            )}
            {testimonials.length > 1 && (
              <div className="flex flex-col">
                {testimonials.slice(1, 3).map((item, i, side) => (
                  <Reveal key={item.id} delay={80 + i * 80}>
                    <figure
                      className={cn(
                        "border-line-dark border-t py-[22px]",
                        i === side.length - 1 && "border-b",
                      )}
                    >
                      <blockquote className="text-[15px] text-neutral-300">&rdquo;{item.quote}&rdquo;</blockquote>
                      <figcaption className="mt-2.5 text-[12.5px] tracking-[0.12em] text-neutral-500 uppercase">
                        {item.name}
                      </figcaption>
                    </figure>
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* מיקום ושעות + צור קשר */}
      <section className="bg-paper text-ink py-16 sm:py-24">
        <Container className="grid gap-12 lg:grid-cols-2">
          <Reveal>
            <div>
              <SectionHeading cut eyebrow={t("locationsEyebrow")} title={t("locationsTitle")} />
              <dl className="mt-8 space-y-3 text-neutral-700">
                <div className="flex gap-3">
                  <dt className="font-medium">{t("addressLabel")}</dt>
                  <dd>{contact.address}</dd>
                </div>
                <div className="flex gap-3">
                  <dt className="font-medium">{t("phoneLabel")}</dt>
                  <dd>{contact.phone}</dd>
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
              <SectionHeading cut eyebrow={t("contactEyebrow")} title={t("contactTitle")} />
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
