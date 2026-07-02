import type { Metadata } from "next";
import { getCourses } from "@/server/actions/admin/courses";
import { CoursesForm } from "@/components/admin/courses-form";

export const metadata: Metadata = { title: "קורסים | ניהול" };
export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  const courses = await getCourses();

  return (
    <div>
      <h1 className="text-2xl font-semibold">קורסי אקדמיה</h1>
      <p className="mt-1 text-neutral-400">
        קורסי האקדמיה המוצגים ב-/academy. עברית חובה, אנגלית/ערבית אופציונלי.
      </p>
      <div className="mt-6 max-w-3xl">
        <CoursesForm
          initialValues={courses.map((c) => ({
            id: c.id,
            slug: c.slug,
            order: c.order,
            nameHe: c.nameHe,
            nameEn: c.nameEn ?? "",
            nameAr: c.nameAr ?? "",
            descriptionHe: c.descriptionHe,
            descriptionEn: c.descriptionEn ?? "",
            descriptionAr: c.descriptionAr ?? "",
            durationHe: c.durationHe,
            durationEn: c.durationEn ?? "",
            durationAr: c.durationAr ?? "",
            levelHe: c.levelHe,
            levelEn: c.levelEn ?? "",
            levelAr: c.levelAr ?? "",
            priceShekels: c.priceAgorot != null ? (c.priceAgorot / 100).toString() : "",
            depositPercent: c.depositPercent,
            capacity: c.capacity ?? undefined,
            detailsHe: c.detailsHe ?? "",
            detailsEn: c.detailsEn ?? "",
            detailsAr: c.detailsAr ?? "",
            syllabusHe: c.syllabusHe ?? "",
            syllabusEn: c.syllabusEn ?? "",
            syllabusAr: c.syllabusAr ?? "",
            active: c.active,
          }))}
        />
      </div>
    </div>
  );
}
