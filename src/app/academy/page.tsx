import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/section-heading";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { buttonVariants } from "@/components/ui/button";
import { courses } from "@/lib/academy-data";

export const metadata: Metadata = {
  title: "אקדמיה",
  description: "אקדמיית Restyle — קורסים מקצועיים בעיצוב שיער ובספרות, מהמתחילים ועד רמת מומחה.",
};

export default function AcademyPage() {
  return (
    <Container className="py-20">
      <SectionHeading
        eyebrow="אקדמיית Restyle"
        title="למדו את המקצוע מהמיטב"
        description="קורסים מקצועיים בעיצוב שיער, פייד ועיצוב זקן — בהדרכת הצוות המוביל שלנו. כל קורס משלב תיאוריה ועבודה מעשית על דגמים."
      />

      <div className="mt-12 grid items-start gap-12 lg:grid-cols-2">
        <ImagePlaceholder label="תמונת אקדמיה" className="aspect-[4/3] rounded-lg" />
        <div className="space-y-6 text-neutral-300">
          <p>
            אקדמיית Restyle הוקמה כדי להעביר את הידע, הטכניקה והסטנדרט המקצועי שלנו לדור
            הבא של אנשי המקצוע. הלימוד בקבוצות קטנות, בסביבת עבודה אמיתית ובליווי אישי צמוד.
          </p>
          <p>
            לפרטים על מועדי פתיחה, מחירים ותנאי הרשמה — צרו איתנו קשר ונשמח לספר לכם הכול.
          </p>
        </div>
      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-2">
        {courses.map((course) => (
          <div
            key={course.slug}
            className="rounded-lg border border-line-dark bg-ink-soft p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-lg font-bold text-white">{course.name}</h2>
              <span className="shrink-0 rounded-full border border-accent/40 px-3 py-1 text-xs text-accent">
                {course.level}
              </span>
            </div>
            <p className="mt-3 text-sm text-neutral-400">{course.description}</p>
            <p className="mt-4 text-xs uppercase tracking-wide text-neutral-500">
              משך: {course.duration}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <Link href="/contact" className={buttonVariants({ size: "lg" })}>
          לפרטים והרשמה — צרו קשר
        </Link>
      </div>
    </Container>
  );
}
