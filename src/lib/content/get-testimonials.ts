import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";

export const TESTIMONIALS_TAG = "testimonials";

export type TestimonialItem = { id: string; name: string; quote: string };

function pick(locale: string, he: string, en: string | null, ar: string | null) {
  if (locale === "en" && en) return en;
  if (locale === "ar" && ar) return ar;
  return he;
}

async function fetchTestimonials() {
  try {
    return await db.testimonial.findMany({ where: { active: true }, orderBy: { order: "asc" } });
  } catch (err) {
    console.error("[content] failed to load testimonials:", err);
    return [];
  }
}

const cachedFetchTestimonials = unstable_cache(fetchTestimonials, ["testimonials-list"], {
  tags: [TESTIMONIALS_TAG],
});

/** המלצות לקוחות ל-locale הנתון, עם fallback ל-messages/*.json אם ה-DB ריק/לא נגיש. */
export async function getTestimonials(locale: string): Promise<TestimonialItem[]> {
  const rows = await cachedFetchTestimonials();
  if (rows.length > 0) {
    return rows.map((r) => ({
      id: r.id,
      name: pick(locale, r.nameHe, r.nameEn, r.nameAr),
      quote: pick(locale, r.quoteHe, r.quoteEn, r.quoteAr),
    }));
  }

  const messages = (await import(`../../../messages/${locale}.json`)).default;
  return (messages.testimonialsData.items as { name: string; quote: string }[]).map(
    (item, i) => ({ id: String(i), ...item }),
  );
}
