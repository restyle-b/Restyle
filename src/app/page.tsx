import Link from "next/link";
import { Container } from "@/components/ui/container";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/section-heading";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { Reveal } from "@/components/reveal";
import { BookingLink } from "@/components/booking-link";
import { siteConfig } from "@/lib/config";
import { services } from "@/lib/services-data";
import { testimonials } from "@/lib/testimonials-data";

export default function HomePage() {
  return (
    <>
      {/*
        Hero: רקע fixed שנשאר "צמוד" למסך בזמן שהתוכן גולש מעליו (בהשראת
        menspire.com) — z-index שלילי כך שהסקציה הבאה (רקע אטום) מכסה אותו
        בטבעיות בזמן הגלילה.
      */}
      <section className="relative flex min-h-[100svh] items-start sm:min-h-[170vh]">
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center"
          style={{ backgroundImage: "url(/images/hero-bg.jpg)" }}
        >
          <div className="absolute inset-0 bg-ink/55" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/90 via-ink/70 to-ink" />
        </div>
        <Container className="relative z-10 py-24 pt-[calc(4rem+6rem)]">
          <p className="font-display text-sm uppercase tracking-[0.3em] text-accent">
            מספרת פרימיום · אקדמיה
          </p>
          <h1 className="font-display mt-6 max-w-3xl text-4xl font-extrabold leading-tight text-white sm:text-6xl">
            {siteConfig.name} — דיוק, סגנון ומקצועיות
          </h1>
          <p className="mt-6 max-w-xl text-lg text-neutral-300">
            חוויית עיצוב שיער ברמה הגבוהה ביותר, צוות מקצועי ואקדמיה להכשרת מעצבים.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <BookingLink
              className={buttonVariants({ size: "lg", className: "rounded-none uppercase tracking-[0.2em]" })}
            >
              קביעת תור
            </BookingLink>
            <Link
              href="/services"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "rounded-none uppercase tracking-[0.2em]",
              })}
            >
              לשירותים
            </Link>
          </div>
        </Container>
      </section>

      {/* שירותים */}
      <section className="bg-paper py-24 text-ink">
        <Container>
          <Reveal>
            <SectionHeading center eyebrow="מה שאנחנו עושים" title="שירותי המספרה" />
          </Reveal>
          <div className="mt-16 grid gap-px overflow-hidden border border-line-light sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Reveal key={service.slug}>
                <div className="h-full border-line-light bg-white p-8 transition-colors hover:bg-paper sm:border-l">
                  <h3 className="font-display text-lg font-bold uppercase tracking-wide">{service.name}</h3>
                  <p className="mt-3 text-sm text-neutral-600">{service.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-12 flex justify-center">
            <Link
              href="/services"
              className={buttonVariants({
                variant: "outline",
                className: "rounded-none uppercase tracking-[0.2em]",
              })}
            >
              לכל השירותים
            </Link>
          </Reveal>
        </Container>
      </section>

      {/* CTA קביעת תור */}
      <section className="bg-ink py-24 text-center">
        <Container className="flex flex-col items-center">
          <Reveal>
            <p className="font-display text-sm uppercase tracking-[0.3em] text-accent">
              קביעת תור
            </p>
            <h2 className="font-display mt-3 max-w-xl text-2xl font-bold text-white sm:text-3xl">
              מוכנים לתור הבא שלכם?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-neutral-300">
              קביעת תור מתבצעת באפליקציית ReStyle — מהירה, נוחה וזמינה 24/7.
            </p>
          </Reveal>
          <Reveal className="mt-8">
            <BookingLink
              className={buttonVariants({ size: "lg", className: "rounded-none uppercase tracking-[0.2em]" })}
            >
              קביעת תור באפליקציה
            </BookingLink>
          </Reveal>
        </Container>
      </section>

      {/* אקדמיה */}
      <section className="bg-paper text-ink">
        <Reveal>
          <ImagePlaceholder label="תמונת אקדמיה" className="aspect-[16/9] sm:aspect-[21/9]" />
        </Reveal>
        <Container className="py-20">
          <Reveal>
            <SectionHeading
              center
              eyebrow="האקדמיה שלנו"
              title="למדו את המקצוע מהמיטב"
              description="קורסים מקצועיים בעיצוב שיער ועיצוב זקן, מההתחלה ועד רמת מומחה — בהדרכת הצוות המוביל שלנו."
              className="mx-auto"
            />
          </Reveal>
          <Reveal className="mt-8 flex justify-center">
            <Link href="/academy" className={buttonVariants({ className: "rounded-none uppercase tracking-[0.2em]" })}>
              לכל הקורסים
            </Link>
          </Reveal>
        </Container>
      </section>

      {/* אודות תקציר */}
      <section className="bg-ink">
        <Reveal>
          <ImagePlaceholder label="תמונת הסטודיו" className="aspect-[16/9] sm:aspect-[21/9]" />
        </Reveal>
        <Container className="py-20">
          <Reveal>
            <SectionHeading
              light
              center
              eyebrow="הסיפור שלנו"
              title="יותר ממספרה"
              description="ReStyle נוסדה מתוך אמונה שעיצוב שיער הוא מקצוע — שילוב של אומנות, טכניקה ושירות אישי. הצוות שלנו מחויב לתוצאה ולחוויה בכל ביקור."
              className="mx-auto"
            />
          </Reveal>
          <Reveal className="mt-8 flex justify-center">
            <Link
              href="/about"
              className={buttonVariants({ variant: "outline", className: "rounded-none uppercase tracking-[0.2em]" })}
            >
              קרא עוד עלינו
            </Link>
          </Reveal>
        </Container>
      </section>

      {/* גלריה */}
      <section className="bg-paper py-24 text-ink">
        <Container>
          <Reveal>
            <SectionHeading center eyebrow="עבודות נבחרות" title="גלריה" />
          </Reveal>
          <div className="mt-16 grid grid-cols-2 gap-px sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Reveal key={i}>
                <ImagePlaceholder label="תמונת עבודה" className="aspect-square" />
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-12 flex justify-center">
            <Link
              href="/gallery"
              className={buttonVariants({ variant: "outline", className: "rounded-none uppercase tracking-[0.2em]" })}
            >
              לגלריה המלאה
            </Link>
          </Reveal>
        </Container>
      </section>

      {/* המלצות */}
      <section className="bg-ink py-24">
        <Container>
          <Reveal>
            <SectionHeading center light eyebrow="מה אומרים עלינו" title="לקוחות מספרים" />
          </Reveal>
          <div className="mt-16 grid gap-px sm:grid-cols-3">
            {testimonials.map((t) => (
              <Reveal key={t.name}>
                <figure className="h-full border-t border-line-dark px-6 py-8 text-center">
                  <span className="font-display text-4xl text-accent">&rdquo;</span>
                  <blockquote className="mt-2 text-neutral-300">{t.quote}</blockquote>
                  <figcaption className="mt-4 font-display text-sm font-semibold uppercase tracking-wide text-white">
                    {t.name}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* מיקום ושעות + צור קשר */}
      <section className="bg-paper py-24 text-ink">
        <Container className="grid gap-12 lg:grid-cols-2">
          <Reveal>
            <div>
              <SectionHeading eyebrow="בואו לבקר" title="מיקום ושעות פתיחה" />
              <dl className="mt-8 space-y-3 text-neutral-700">
                <div className="flex gap-3">
                  <dt className="font-medium">כתובת:</dt>
                  <dd>{siteConfig.contact.address}</dd>
                </div>
                <div className="flex gap-3">
                  <dt className="font-medium">טלפון:</dt>
                  <dd>{siteConfig.contact.phone}</dd>
                </div>
                <div className="flex gap-3">
                  <dt className="font-medium">שעות פעילות:</dt>
                  <dd>
                    {siteConfig.hours.map((row) => `${row.day} ${row.hours}`).join(", ")}
                  </dd>
                </div>
              </dl>
              <Link
                href="/locations"
                className={buttonVariants({
                  variant: "outline",
                  className: "mt-8 rounded-none uppercase tracking-[0.2em]",
                })}
              >
                לפרטי הגעה ומפה
              </Link>
            </div>
          </Reveal>
          <Reveal>
            <div>
              <SectionHeading eyebrow="יש לכם שאלה?" title="צרו קשר" />
              <Link
                href="/contact"
                className={buttonVariants({ className: "mt-8 rounded-none uppercase tracking-[0.2em]" })}
              >
                לעמוד צור קשר
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
