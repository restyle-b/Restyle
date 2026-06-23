import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";

export const GALLERY_TAG = "gallery-images";

export type GalleryImageItem = { id: string; imageUrl: string; alt: string };

function pick(locale: string, he: string, en: string | null, ar: string | null) {
  if (locale === "en" && en) return en;
  if (locale === "ar" && ar) return ar;
  return he;
}

async function fetchGalleryImages() {
  try {
    return await db.galleryImage.findMany({ where: { active: true }, orderBy: { order: "asc" } });
  } catch (err) {
    console.error("[content] failed to load gallery images:", err);
    return [];
  }
}

const cachedFetchGalleryImages = unstable_cache(fetchGalleryImages, ["gallery-images-list"], {
  tags: [GALLERY_TAG],
});

/**
 * תמונות גלריה מ-Admin. אם ריק (לא הועלו תמונות עדיין) — מחזיר [], והעמודים
 * הציבוריים ממשיכים להציג את ה-placeholders הקיימים (ראה gallery/page.tsx).
 */
export async function getGalleryImages(locale: string): Promise<GalleryImageItem[]> {
  const rows = await cachedFetchGalleryImages();
  return rows.map((r) => ({
    id: r.id,
    imageUrl: r.imageUrl,
    alt: pick(locale, r.altHe, r.altEn, r.altAr),
  }));
}
