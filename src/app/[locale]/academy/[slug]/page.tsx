import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/navigation";
import { EnrollForm } from "@/components/courses/enroll-form";
import { formatAgorot } from "@/lib/format";
import { getCourseBySlug } from "@/lib/content/get-courses";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const course = await getCourseBySlug(locale, slug);
  if (!course) return {};
  return { title: course.name, description: course.description };
}

// שאילתה חיה (מקומות פנויים) — לא לרנדר סטטית.
export const dynamic = "force-dynamic";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "academyCommerce" });
  const course = await getCourseBySlug(locale, slug);
  if (!course) notFound();

  const purchasable = course.priceAgorot != null;
  const soldOut = course.seatsRemaining === 0;
  const depositAgorot =
    course.priceAgorot != null ? Math.round((course.priceAgorot * course.depositPercent) / 100) : 0;
  const depositAvailable = depositAgorot > 0 && depositAgorot < (course.priceAgorot ?? 0);

  return (
    <Container className="py-20 sm:py-28">
      <Link href="/academy" className="link-underline text-sm text-neutral-400 transition-colors hover:text-white">
        ← {t("backToAcademy")}
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* פרטי הקורס */}
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-white sm:text-4xl">
            {course.name}
          </h1>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-400">
            <span>
              {t("durationLabel")}: <span className="text-neutral-200">{course.duration}</span>
            </span>
            <span>
              {t("levelLabel")}: <span className="text-neutral-200">{course.level}</span>
            </span>
          </div>

          <p className="mt-6 leading-relaxed text-neutral-300">{course.description}</p>

          {course.details && (
            <div className="mt-8">
              <h2 className="font-display text-lg font-semibold text-white">{t("detailsTitle")}</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-neutral-300">{course.details}</p>
            </div>
          )}

          {course.syllabus && (
            <div className="mt-8">
              <h2 className="font-display text-lg font-semibold text-white">{t("syllabusTitle")}</h2>
              <p className="mt-3 whitespace-pre-line leading-relaxed text-neutral-300">{course.syllabus}</p>
            </div>
          )}
        </div>

        {/* הרשמה/מחיר — sticky בדסקטופ */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-lg border border-line-dark bg-ink-soft p-6">
            {purchasable ? (
              <>
                <p className="text-sm text-neutral-400">{t("priceLabel")}</p>
                <p className="mt-1 text-3xl font-semibold text-accent">
                  {formatAgorot(course.priceAgorot!, locale)}
                </p>
                {depositAvailable && (
                  <p className="mt-3 text-sm text-neutral-300">
                    {t("depositInfo", {
                      percent: course.depositPercent,
                      amount: formatAgorot(depositAgorot, locale),
                    })}
                  </p>
                )}
                {course.seatsRemaining != null && course.seatsRemaining > 0 && (
                  <p className="mt-3 text-sm text-accent">
                    {t("seatsLeft", { count: course.seatsRemaining })}
                  </p>
                )}

                {soldOut ? (
                  <p className="mt-6 text-sm font-medium text-neutral-400">{t("soldOut")}</p>
                ) : (
                  <EnrollForm
                    courseId={course.id}
                    priceAgorot={course.priceAgorot!}
                    depositAgorot={depositAgorot}
                    depositAvailable={depositAvailable}
                  />
                )}
              </>
            ) : (
              // קורס תדמיתי (ללא מחיר) — CTA צור-קשר, כמו לפני Phase 7.
              <>
                <p className="text-neutral-300">{t("contactCta")}</p>
                <Link href="/contact" className="mt-4 inline-block text-sm font-medium text-accent hover:underline">
                  {t("contactCta")}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}
