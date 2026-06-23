import type { Metadata } from "next";
import { getGalleryImages } from "@/server/actions/admin/gallery";
import { GalleryForm } from "@/components/admin/gallery-form";

export const metadata: Metadata = { title: "גלריה | ניהול" };
export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const images = await getGalleryImages();

  return (
    <div>
      <h1 className="text-2xl font-semibold">גלריה</h1>
      <p className="mt-1 text-neutral-400">
        תמונות המוצגות ב-/gallery ובדף הבית. הזנת כתובת URL ישירה לתמונה (העלאת קבצים ל-R2
        עדיין לא חוברה).
      </p>
      <div className="mt-6 max-w-3xl">
        <GalleryForm
          initialValues={images.map((img) => ({
            id: img.id,
            order: img.order,
            imageUrl: img.imageUrl,
            altHe: img.altHe,
            altEn: img.altEn ?? "",
            altAr: img.altAr ?? "",
            active: img.active,
          }))}
        />
      </div>
    </div>
  );
}
