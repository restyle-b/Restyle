import Link from "next/link";
import { Container } from "@/components/ui/container";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/section-heading";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { Reveal } from "@/components/reveal";
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
      <section className="relative flex min-h-[calc(100vh-4rem)] items-center">
        <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[--color-ink-soft] to-[--color-ink]" />
        <Container className="relative z-10 py-24">
          <p className="font-display text-sm uppercase tracking-[0.3em] text-[--color-accent]">
            מספרת פרימיום · אקדמיה · חנות
          </p>
          <h1 className="font-display mt-6 max-w-3xl text-4xl font-extrabold leading-tight text-white sm:text-6xl">
            {siteConfig.name} — דיוק, סגנון ומקצועיות
          </h1>
          <p className="mt-6 max-w-xl text-lg text-neutral-300">
            חוויית עיצוב שיער ברמה הגבוהה ביותר, מוצרי טיפוח נבחרים, ואקדמיה מקצועית.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a href={siteConfig.booking.web} className={buttonVariants({ size: "lg" })}>
              קביעת תור
            </a>
            <Link href="/shop" className={buttonVariants({ variant: "outline", size: "lg" })}>
              לחנות
            </Link>
          </div>
        </Container>
      </section>

      {/* שירותים */}
      <section className="bg-[--color-paper] py-20 text-[--color-ink]">
        <Container>
          <Reveal>
            <SectionHeading eyebrow="מה שאנחנו עושים" title="שירותי המספרה" />
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Reveal key={service.slug}>
                <div className="rounded-lg border border-[--color-line-light] bg-white p-6">
                  <h3 className="font-display text-lg font-bold">{service.name}</h3>
                  <p className="mt-2 text-sm text-neutral-600">{service.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-10">
            <Link href="/services" className={buttonVariants({ variant: "outline" })}>
              לכל השירותים
            </Link>
          </Reveal>
        </Container>
      </section>

      {/* CTA קביעת תור */}
      <section className="bg-[--color-ink] py-20">
        <Container className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <Reveal>
            <div>
              <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
                מוכנים לתור הבא שלכם?
              </h2>
              <p className="mt-3 max-w-md text-neutral-300">
                קביעת תור מתבצעת באפליקציית Restyle — מהירה, נוחה וזמינה 24/7.
              </p>
            </div>
          </Reveal>
          <Reveal>
            <a href={siteConfig.booking.web} className={buttonVariants({ size: "lg" })}>
              קביעת תור באפליקציה
            </a>
          </Reveal>
        </Container>
      </section>

      {/* אקדמיה */}
      <section className="bg-[--color-paper] py-20 text-[--color-ink]">
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <div>
              <SectionHeading
                eyebrow="אקדמיית Restyle"
                title="למדו את המקצוע מהמיטב"
                description="קורסים מקצועיים בעיצוב שיער ועיצוב זקן, מההתחלה ועד רמת מומחה — בהדרכת הצוות המוביל שלנו."
              />
              <Link href="/academy" className={buttonVariants({ className: "mt-8" })}>
                לכל הקורסים
              </Link>
            </div>
          </Reveal>
          <Reveal>
            <ImagePlaceholder label="תמונת אקדמיה" className="aspect-[4/3] rounded-lg" />
          </Reveal>
        </Container>
      </section>

      {/* אודות תקציר */}
      <section className="bg-[--color-ink] py-20">
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal className="lg:order-2">
            <ImagePlaceholder label="תמונת הסטודיו" className="aspect-[4/3] rounded-lg" />
          </Reveal>
          <Reveal>
            <div>
              <SectionHeading
                light
                eyebrow="הסיפור שלנו"
                title="יותר ממספרה"
                description="Restyle נוסדה מתוך אמונה שעיצוב שיער הוא מקצוע — שילוב של אומנות, טכניקה ושירות אישי. הצוות שלנו מחויב לתוצאה ולחוויה בכל ביקור."
              />
              <Link href="/about" className={buttonVariants({ variant: "outline", className: "mt-8" })}>
                קרא עוד עלינו
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* גלריה */}
      <section className="bg-[--color-paper] py-20 text-[--color-ink]">
        <Container>
          <Reveal>
            <SectionHeading eyebrow="עבודות נבחרות" title="גלריה" />
          </Reveal>
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Reveal key={i}>
                <ImagePlaceholder label="תמונת עבודה" className="aspect-square rounded-md" />
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-10">
            <Link href="/gallery" className={buttonVariants({ variant: "outline" })}>
              לגלריה המלאה
            </Link>
          </Reveal>
        </Container>
      </section>

      {/* המלצות */}
      <section className="bg-[--color-ink] py-20">
        <Container>
          <Reveal>
            <SectionHeading light eyebrow="מה אומרים עלינו" title="לקוחות מספרים" />
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {testimonials.map((t) => (
              <Reveal key={t.name}>
                <figure className="rounded-lg border border-[--color-line-dark] bg-[--color-ink-soft] p-6">
                  <blockquote className="text-neutral-300">&ldquo;{t.quote}&rdquo;</blockquote>
                  <figcaption className="mt-4 font-display text-sm font-semibold text-white">
                    {t.name}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* מיקום ושעות + צור קשר */}
      <section className="bg-[--color-paper] py-20 text-[--color-ink]">
        <Container className="grid gap-12 lg:grid-cols-2">
          <Reveal>
            <div>
              <SectionHeading eyebrow="בואו לבקר" title="מיקום ושעות פתיחה" />
              <dl className="mt-8 space-y-3 text-neutral-700">
                <div className="flex gap-3">
                  <dt className="font-medium">כתובת:</dt>
                  <dd>{siteConfig.contact.address || "יפורסם בקרוב"}</dd>
                </div>
                <div className="flex gap-3">
                  <dt className="font-medium">טלפון:</dt>
                  <dd>{siteConfig.contact.phone || "יפורסם בקרוב"}</dd>
                </div>
                <div className="flex gap-3">
                  <dt className="font-medium">שעות פעילות:</dt>
                  <dd>א&apos;–ה&apos; 09:00–20:00, ו&apos; 09:00–14:00</dd>
                </div>
              </dl>
            </div>
          </Reveal>
          <Reveal>
            <div>
              <SectionHeading eyebrow="יש לכם שאלה?" title="צרו קשר" />
              <Link href="/contact" className={buttonVariants({ className: "mt-8" })}>
                לעמוד צור קשר
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
