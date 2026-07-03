import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/section-heading";
import { ImagePlaceholder } from "@/components/image-placeholder";
import { InstagramIcon } from "@/components/icons/instagram-icon";
import { buttonVariants } from "@/components/ui/button";
import { getGalleryImages } from "@/lib/content/get-gallery";
import { getSiteContactInfo } from "@/lib/content/get-site-settings";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "gallery" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "gallery" });
  const images = await getGalleryImages(locale);
  const contact = await getSiteContactInfo();

  return (
    <Container className="py-20">
      <SectionHeading light eyebrow={t("eyebrow")} title={t("title")} />

      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <div className="relative aspect-square overflow-hidden rounded-md">
          <Image
            src="/images/gallery-studio-1.jpg"
            alt={t("studioImageLabel")}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover content-img"
          />
        </div>
        {images.length > 0
          ? images.map((image) => (
              <div key={image.id} className="relative aspect-square overflow-hidden rounded-md">
                {/* eslint-disable-next-line @next/next/no-img-element -- כתובת חיצונית
                    שמוזנת ע"י Admin; אין remotePatterns ל-next/image (מניעת SSRF, ראה
                    docs/ARCHITECTURE.md §7), אז מוצגת ב-<img> רגיל. */}
                <img
                  src={image.imageUrl}
                  alt={image.alt}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover content-img"
                />
              </div>
            ))
          : Array.from({ length: 11 }).map((_, i) => (
              <ImagePlaceholder key={i} label={t("workImageLabel")} className="aspect-square rounded-md" />
            ))}
      </div>

      <div className="mt-12 flex justify-center">
        <a
          href={contact.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ size: "lg" })}
        >
          <InstagramIcon className="h-4 w-4" />
          {t("instagramCta")}
        </a>
      </div>
    </Container>
  );
}
