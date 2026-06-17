import Link from "next/link";
import { Container } from "@/components/ui/container";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/config";

/* דף בית — שלד ראשוני (Phase 1). הסקציות יתמלאו בתוכן ותמונות ב-Phase 2. */
export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[--color-ink-soft] to-[--color-ink]" />
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

      {/* Placeholder לסקציות הבאות (Phase 2) */}
      <section className="bg-[--color-paper] py-20 text-[--color-ink]">
        <Container>
          <h2 className="font-display text-3xl font-bold">בקרוב: שירותים, מוצרים נבחרים ואקדמיה</h2>
          <p className="mt-4 max-w-2xl text-neutral-600">
            שלד האתר הוקם. הסקציות (שירותים, מוצרים, אקדמיה, גלריה, המלצות) יתווספו בשלב הבא לפי
            <span className="font-medium"> docs/DESIGN.md</span>.
          </p>
        </Container>
      </section>
    </>
  );
}
