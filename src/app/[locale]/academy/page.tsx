import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/section-heading";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { ScrollFeature } from "@/components/scroll-feature";
import { buttonVariants } from "@/components/ui/button";
import { getCourses } from "@/lib/content/get-courses";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "academy" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function AcademyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "academy" });
  const courses = await getCourses(locale);
  return (
    <div className="relative overflow-hidden">
      <div className="glow-orb start-0 -top-20 h-80 w-80" aria-hidden="true" />
      <Container className="relative py-20">
        <SectionHeading light eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />

        <div className="mt-12 grid items-start gap-12 lg:grid-cols-2">
          <div className="lg:sticky lg:top-28">
            <ImagePlaceholder label={t("imageLabel")} className="aspect-[4/3] rounded-lg" />
          </div>
          <div className="space-y-16 text-neutral-300 lg:py-12">
            <ScrollFeature>
              <p className="text-lg leading-relaxed">{t("paragraph1")}</p>
            </ScrollFeature>
            <ScrollFeature>
              <p className="text-lg leading-relaxed">{t("paragraph2")}</p>
            </ScrollFeature>
          </div>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {courses.map((course) => (
            <div key={course.slug} className="border-line-dark bg-ink-soft rounded-lg border p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-lg font-bold text-white">{course.name}</h2>
                <span className="border-accent/40 text-accent shrink-0 rounded-full border px-3 py-1 text-xs">
                  {course.level}
                </span>
              </div>
              <p className="mt-3 text-sm text-neutral-400">{course.description}</p>
              <p className="mt-4 text-xs tracking-wide text-neutral-500 uppercase">
                {t("durationLabel", { duration: course.duration })}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <Link href="/contact" className={buttonVariants({ size: "lg", variant: "light" })}>
            {t("ctaText")}
          </Link>
        </div>
      </Container>
    </div>
  );
}
