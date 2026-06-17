import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/section-heading";
import { ImagePlaceholder } from "@/components/image-placeholder";

export const metadata: Metadata = {
  title: "גלריה",
  description: "עבודות נבחרות מהמספרה — תספורות, עיצוב זקן וצבע.",
};

export default function GalleryPage() {
  return (
    <Container className="py-20">
      <SectionHeading eyebrow="עבודות נבחרות" title="גלריה" />

      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <ImagePlaceholder key={i} label="תמונת עבודה" className="aspect-square rounded-md" />
        ))}
      </div>
    </Container>
  );
}
