import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { courseSlugs } from "@/lib/academy-data";

export const COURSES_TAG = "courses";

export type CourseItem = {
  slug: string;
  name: string;
  description: string;
  duration: string;
  level: string;
};

function pick(locale: string, he: string, en: string | null, ar: string | null) {
  if (locale === "en" && en) return en;
  if (locale === "ar" && ar) return ar;
  return he;
}

async function fetchCourses() {
  try {
    return await db.course.findMany({ where: { active: true }, orderBy: { order: "asc" } });
  } catch (err) {
    console.error("[content] failed to load courses:", err);
    return [];
  }
}

const cachedFetchCourses = unstable_cache(fetchCourses, ["courses-list"], {
  tags: [COURSES_TAG],
});

/** קורסי האקדמיה ל-locale הנתון, עם fallback ל-messages/*.json אם ה-DB ריק/לא נגיש. */
export async function getCourses(locale: string): Promise<CourseItem[]> {
  const rows = await cachedFetchCourses();
  if (rows.length > 0) {
    return rows.map((r) => ({
      slug: r.slug,
      name: pick(locale, r.nameHe, r.nameEn, r.nameAr),
      description: pick(locale, r.descriptionHe, r.descriptionEn, r.descriptionAr),
      duration: pick(locale, r.durationHe, r.durationEn, r.durationAr),
      level: pick(locale, r.levelHe, r.levelEn, r.levelAr),
    }));
  }

  const messages = (await import(`../../../messages/${locale}.json`)).default;
  return courseSlugs.map((slug) => ({
    slug,
    name: messages.academyData[slug].name,
    description: messages.academyData[slug].description,
    duration: messages.academyData[slug].duration,
    level: messages.academyData[slug].level,
  }));
}
