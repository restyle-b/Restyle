import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/section-heading";
import { ImagePlaceholder } from "@/components/image-placeholder";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "gallery" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default function GalleryPage() {
  const t = useTranslations("gallery");
  return (
    <Container className="py-20">
      <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />

      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <ImagePlaceholder key={i} label={t("workImageLabel")} className="aspect-square rounded-md" />
        ))}
      </div>
    </Container>
  );
}
