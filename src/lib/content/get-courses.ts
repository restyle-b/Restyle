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
  priceAgorot: number | null; // null → קורס תדמיתי (לא נמכר)
  depositPercent: number;
};

export type CourseDetail = CourseItem & {
  id: string;
  details: string | null;
  syllabus: string | null;
  capacity: number | null; // null → ללא הגבלת מקומות
  seatsRemaining: number | null; // null → ללא הגבלה
  // SEO per-locale (Phase 15 / M3) — null אם לא הוגדר לאף locale; הצרכן
  // (generateMetadata) נופל ל-name/description במקרה הזה.
  seoTitle: string | null;
  seoDescription: string | null;
};

function pick(locale: string, he: string, en: string | null, ar: string | null) {
  if (locale === "en" && en) return en;
  if (locale === "ar" && ar) return ar;
  return he;
}

/** כמו pick, אבל לשדות אופציונליים (SEO) — he עצמו יכול להיות null/ריק, ואז מחזיר null. */
function pickOptional(
  locale: string,
  he: string | null,
  en: string | null,
  ar: string | null,
): string | null {
  if (locale === "en" && en) return en;
  if (locale === "ar" && ar) return ar;
  return he || null;
}

async function fetchCourses() {
  try {
    return await db.course.findMany({
      // publishAt=null → מתפרסם מיד עם active; עתידי → "מתוזמן" ומוסתר עד אז (Phase 15).
      where: { active: true, OR: [{ publishAt: null }, { publishAt: { lte: new Date() } }] },
      orderBy: { order: "asc" },
    });
  } catch (err) {
    console.error("[content] failed to load courses:", err);
    return [];
  }
}

// revalidate: מתרענן לבד כל 5 דק' (בנוסף ל-revalidateTag של האדמין) כך ששינוי
// ישיר ב-DB מופיע בלי redeploy — עקבי עם get-products/get-categories.
const cachedFetchCourses = unstable_cache(fetchCourses, ["courses-list"], {
  tags: [COURSES_TAG],
  revalidate: 300,
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
      priceAgorot: r.priceAgorot,
      depositPercent: r.depositPercent,
    }));
  }

  const messages = (await import(`../../../messages/${locale}.json`)).default;
  return courseSlugs.map((slug) => ({
    slug,
    name: messages.academyData[slug].name,
    description: messages.academyData[slug].description,
    duration: messages.academyData[slug].duration,
    level: messages.academyData[slug].level,
    priceAgorot: null,
    depositPercent: 20,
  }));
}

/**
 * קורס בודד לפי slug — **שאילתה חיה** (לא cached) כדי שמספר המקומות הפנויים
 * יהיה מדויק (נספר דינמית מהרשמות בסטטוס DEPOSIT_PAID/PAID). מחזיר null אם
 * הקורס לא קיים ב-DB ואין fallback תוכן.
 */
export async function getCourseBySlug(locale: string, slug: string): Promise<CourseDetail | null> {
  let row;
  try {
    row = await db.course.findUnique({ where: { slug } });
  } catch (err) {
    console.error("[content] failed to load course:", err);
    row = null;
  }

  // בדיקה מפורשת (לא מכוסה ע"י ה-cache של fetchCourses — זו findUnique נפרדת):
  // מרחיב את תנאי הנראות הקיים (row.active) כך שיכלול גם publishAt עתידי
  // ("מתוזמן", Phase 15) — אותה נפילה ל-fallback כמו שקורה היום ל-active=false,
  // בלי לשנות את ההתנהגות הקיימת עבור המקרה הזה.
  const isVisible = Boolean(row?.active) && (row?.publishAt == null || row.publishAt <= new Date());
  if (row && isVisible) {
    let seatsRemaining: number | null = null;
    if (row.capacity != null) {
      const taken = await db.enrollment.count({
        where: { courseId: row.id, status: { in: ["DEPOSIT_PAID", "PAID"] } },
      });
      seatsRemaining = Math.max(0, row.capacity - taken);
    }
    return {
      id: row.id,
      slug: row.slug,
      name: pick(locale, row.nameHe, row.nameEn, row.nameAr),
      description: pick(locale, row.descriptionHe, row.descriptionEn, row.descriptionAr),
      duration: pick(locale, row.durationHe, row.durationEn, row.durationAr),
      level: pick(locale, row.levelHe, row.levelEn, row.levelAr),
      priceAgorot: row.priceAgorot,
      depositPercent: row.depositPercent,
      details: pick(locale, row.detailsHe ?? "", row.detailsEn, row.detailsAr) || null,
      syllabus: pick(locale, row.syllabusHe ?? "", row.syllabusEn, row.syllabusAr) || null,
      capacity: row.capacity,
      seatsRemaining,
      seoTitle: pickOptional(locale, row.seoTitleHe, row.seoTitleEn, row.seoTitleAr),
      seoDescription: pickOptional(locale, row.seoDescriptionHe, row.seoDescriptionEn, row.seoDescriptionAr),
    };
  }

  // fallback תוכן (DB ריק) — קורס תדמיתי בלבד, לא נמכר.
  const messages = (await import(`../../../messages/${locale}.json`)).default;
  const data = messages.academyData?.[slug];
  if (!data) return null;
  return {
    id: slug,
    slug,
    name: data.name,
    description: data.description,
    duration: data.duration,
    level: data.level,
    priceAgorot: null,
    depositPercent: 20,
    details: null,
    syllabus: null,
    capacity: null,
    seatsRemaining: null,
    seoTitle: null,
    seoDescription: null,
  };
}
