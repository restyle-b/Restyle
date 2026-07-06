"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Course } from "@prisma/client";
import { Plus, MoreHorizontal, Pencil, Copy, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CourseEditSheet } from "@/components/admin/course-edit-sheet";
import {
  deleteCourse,
  duplicateCourse,
  reorderCourse,
  toggleCourseActive,
  type AdminActionResult,
} from "@/server/actions/admin/courses";
import { formatAgorot } from "@/lib/format";
import { utcToJerusalemDatetimeLocal } from "@/lib/admin/course-datetime";
import type { CourseInput } from "@/lib/admin/courses-schema";
import { cn } from "@/lib/utils";

type CourseRow = Course & { _count: { enrollments: number } };

export function CoursesTable({ courses }: { courses: CourseRow[] }) {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseRow | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<CourseRow | null>(null);

  async function handleDelete() {
    if (!deletingCourse) return;
    const result = await deleteCourse(deletingCourse.id);
    if (result.ok) {
      toast.success("הקורס נמחק");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleDuplicate(course: CourseRow) {
    const result = await duplicateCourse(course.id);
    if (result.ok) {
      toast.success("הקורס שוכפל (כטיוטה)");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleReorder(id: string, direction: "up" | "down") {
    const result = await reorderCourse(id, direction);
    if (result.ok) {
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-neutral-400">
          קורסי האקדמיה המוצגים ב-/academy. עברית חובה, אנגלית/ערבית אופציונלי.
        </p>
        <button
          type="button"
          onClick={() => {
            setEditingCourse(null);
            setSheetOpen(true);
          }}
          className={cn(buttonVariants({ size: "md" }))}
        >
          <Plus className="h-4 w-4" />
          קורס חדש
        </button>
      </div>

      {courses.length === 0 ? (
        <p className="mt-8 text-center text-neutral-400">עדיין אין קורסים.</p>
      ) : (
        <div className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>שם</TableHead>
                <TableHead>מחיר</TableHead>
                <TableHead>נרשמים</TableHead>
                <TableHead>קיבולת</TableHead>
                <TableHead>פעילה</TableHead>
                <TableHead>סדר</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course, index) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <p className="font-medium text-white">{course.nameHe}</p>
                    <p className="truncate text-xs text-neutral-500">
                      {course.levelHe} · {course.durationHe}
                    </p>
                  </TableCell>
                  <TableCell>
                    {course.priceAgorot != null ? formatAgorot(course.priceAgorot, "he") : "תדמיתי"}
                  </TableCell>
                  <TableCell>{course._count.enrollments}</TableCell>
                  <TableCell>{course.capacity ?? "ללא הגבלה"}</TableCell>
                  <TableCell>
                    <CourseToggleCell id={course.id} checked={course.active} nameHe={course.nameHe} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleReorder(course.id, "up")}
                        disabled={index === 0}
                        aria-label={`הזזת "${course.nameHe}" למעלה`}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-30"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReorder(course.id, "down")}
                        disabled={index === courses.length - 1}
                        aria-label={`הזזת "${course.nameHe}" למטה`}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-30"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
                          aria-label="פעולות נוספות"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={() => {
                            setEditingCourse(course);
                            setSheetOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                          עריכה
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleDuplicate(course)}>
                          <Copy className="h-4 w-4" />
                          שכפול
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setDeletingCourse(course)} destructive>
                          <Trash2 className="h-4 w-4" />
                          מחיקה
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CourseEditSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        course={editingCourse ? courseToFormInput(editingCourse) : null}
      />

      <ConfirmDialog
        open={deletingCourse !== null}
        onOpenChange={(open) => !open && setDeletingCourse(null)}
        title="מחיקת קורס"
        description={
          deletingCourse && deletingCourse._count.enrollments > 0
            ? `לקורס "${deletingCourse.nameHe}" יש ${deletingCourse._count.enrollments} נרשמים פעילים. מחיקה לצמיתות תשאיר את ההרשמות הקיימות ללא קישור לקורס (השם נשמר בהיסטוריית ההרשמה). להמשיך?`
            : `למחוק את "${deletingCourse?.nameHe}" לצמיתות? הפעולה אינה הפיכה.`
        }
        confirmLabel="מחיקה"
        onConfirm={handleDelete}
      />
    </div>
  );
}

/** ממיר שורת DB לפורמט הטופס — publishAt הופך למחרוזת datetime-local לפי
 * שעון ישראל (ראה course-datetime.ts, הבאג #1 הצפוי אם עושים את זה ידנית). */
function courseToFormInput(course: CourseRow): CourseInput & { id: string } {
  return {
    id: course.id,
    order: course.order,
    nameHe: course.nameHe,
    nameEn: course.nameEn ?? "",
    nameAr: course.nameAr ?? "",
    descriptionHe: course.descriptionHe,
    descriptionEn: course.descriptionEn ?? "",
    descriptionAr: course.descriptionAr ?? "",
    durationHe: course.durationHe,
    durationEn: course.durationEn ?? "",
    durationAr: course.durationAr ?? "",
    levelHe: course.levelHe,
    levelEn: course.levelEn ?? "",
    levelAr: course.levelAr ?? "",
    priceShekels: course.priceAgorot != null ? (course.priceAgorot / 100).toString() : "",
    depositPercent: course.depositPercent,
    capacity: course.capacity ?? undefined,
    detailsHe: course.detailsHe ?? "",
    detailsEn: course.detailsEn ?? "",
    detailsAr: course.detailsAr ?? "",
    syllabusHe: course.syllabusHe ?? "",
    syllabusEn: course.syllabusEn ?? "",
    syllabusAr: course.syllabusAr ?? "",
    active: course.active,
    publishAt: course.publishAt ? utcToJerusalemDatetimeLocal(course.publishAt) : "",
    seoTitleHe: course.seoTitleHe ?? "",
    seoTitleEn: course.seoTitleEn ?? "",
    seoTitleAr: course.seoTitleAr ?? "",
    seoDescriptionHe: course.seoDescriptionHe ?? "",
    seoDescriptionEn: course.seoDescriptionEn ?? "",
    seoDescriptionAr: course.seoDescriptionAr ?? "",
  };
}

/** טוגל "פעיל" אופטימי — אותו דפוס כמו ProductToggleCell (products-table). */
function CourseToggleCell({ id, checked, nameHe }: { id: string; checked: boolean; nameHe: string }) {
  const router = useRouter();
  const [optimistic, setOptimistic] = useState(checked);
  const [isPending, startTransition] = useTransition();

  return (
    <Switch
      checked={optimistic}
      disabled={isPending}
      aria-label={`פעילות — ${nameHe}`}
      onCheckedChange={(value) => {
        setOptimistic(value);
        startTransition(async () => {
          const result: AdminActionResult = await toggleCourseActive(id, value);
          if (result.ok) {
            router.refresh();
          } else {
            setOptimistic(!value);
            toast.error(result.error);
          }
        });
      }}
    />
  );
}
