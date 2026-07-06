import type { Metadata } from "next";
import { getCourses } from "@/server/actions/admin/courses";
import { CoursesTable } from "@/components/admin/courses-table";

export const metadata: Metadata = { title: "קורסים | ניהול" };
export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  const courses = await getCourses();

  return (
    <div>
      <h1 className="text-2xl font-semibold">קורסי אקדמיה</h1>
      <div className="mt-6">
        <CoursesTable courses={courses} />
      </div>
    </div>
  );
}
