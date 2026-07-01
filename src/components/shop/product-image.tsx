import { ImagePlaceholder } from "@/components/image-placeholder";

/**
 * תמונת מוצר — אם קיים imageUrl (הוזן ע"י Admin) מוצגת ב-<img> רגיל (כמו
 * gallery/page.tsx: אין remotePatterns ל-next/image, מניעת SSRF, ראה
 * docs/ARCHITECTURE.md §7), אחרת ImagePlaceholder.
 */
export function ProductImage({
  imageUrl,
  label,
  className,
}: {
  imageUrl: string | null;
  label: string;
  className?: string;
}) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- כתובת חיצונית שמוזנת ע"י Admin
      <img src={imageUrl} alt={label} loading="lazy" className={className} />
    );
  }
  return <ImagePlaceholder label={label} className={className} />;
}
