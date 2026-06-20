import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/section-heading";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { ScrollFeature } from "@/components/scroll-feature";
import { buttonVariants } from "@/components/ui/button";
import { courseSlugs } from "@/lib/academy-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "academy" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default function AcademyPage() {
  const t = useTranslations("academy");
  const tCourses = useTranslations("academyData");
  return (
    <div className="relative overflow-hidden">
      <div className="glow-orb start-0 -top-20 h-80 w-80" aria-hidden="true" />
      <Container className="relative py-20">
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />

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
          {courseSlugs.map((slug) => (
            <div key={slug} className="border-line-dark bg-ink-soft rounded-lg border p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-lg font-bold text-white">
                  {tCourses(`${slug}.name`)}
                </h2>
                <span className="border-accent/40 text-accent shrink-0 rounded-full border px-3 py-1 text-xs">
                  {tCourses(`${slug}.level`)}
                </span>
              </div>
              <p className="mt-3 text-sm text-neutral-400">{tCourses(`${slug}.description`)}</p>
              <p className="mt-4 text-xs tracking-wide text-neutral-500 uppercase">
                {t("durationLabel", { duration: tCourses(`${slug}.duration`) })}
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
