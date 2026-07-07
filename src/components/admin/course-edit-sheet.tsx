"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { courseSchema, type CourseInput } from "@/lib/admin/courses-schema";
import { createCourse, updateCourse } from "@/server/actions/admin/courses";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { buttonVariants } from "@/components/ui/button";
import { adminInputClass as inputClass, adminTextareaClass as textareaClass } from "@/lib/admin/form-styles";
import { cn } from "@/lib/utils";

function emptyValues(): CourseInput {
  return {
    nameHe: "",
    nameEn: "",
    nameAr: "",
    descriptionHe: "",
    descriptionEn: "",
    descriptionAr: "",
    durationHe: "",
    durationEn: "",
    durationAr: "",
    levelHe: "",
    levelEn: "",
    levelAr: "",
    priceShekels: "",
    depositPercent: 20,
    capacity: undefined,
    detailsHe: "",
    detailsEn: "",
    detailsAr: "",
    syllabusHe: "",
    syllabusEn: "",
    syllabusAr: "",
    active: true,
    publishAt: "",
    seoTitleHe: "",
    seoTitleEn: "",
    seoTitleAr: "",
    seoDescriptionHe: "",
    seoDescriptionEn: "",
    seoDescriptionAr: "",
  };
}

/** כותרת-מקטע מתקפלת — אותו רעיון כמו product-edit-sheet.tsx ("פרטים
 * נוספים"), אבל כאן שני מקטעים נפרדים (24 שדות בסה"כ) כדי לא להעמיס אחד. */
function CollapsibleSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-line-dark pt-4">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-2 text-sm font-medium text-neutral-300 hover:text-white"
      >
        {title}
        <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="mt-4 flex flex-col gap-4">{children}</div>}
    </div>
  );
}

export function CourseEditSheet({
  open,
  onOpenChange,
  course,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null = יצירת קורס חדש; אחרת עריכה. */
  course: (CourseInput & { id: string }) | null;
}) {
  const router = useRouter();
  const [contentOpen, setContentOpen] = useState(false);
  const [seoOpen, setSeoOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CourseInput>({
    resolver: zodResolver(courseSchema),
    defaultValues: course ?? emptyValues(),
  });

  function handleOpenChange(next: boolean) {
    if (next) {
      reset(course ?? emptyValues());
      setContentOpen(false);
      setSeoOpen(false);
    }
    onOpenChange(next);
  }

  async function onSubmit(values: CourseInput) {
    const result = course ? await updateCourse(course.id, values) : await createCourse(values);
    if (result.ok) {
      toast.success(course ? "הקורס עודכן" : "הקורס נוצר");
      onOpenChange(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{course ? "עריכת קורס" : "קורס חדש"}</SheetTitle>
          <SheetDescription>
            {course
              ? "עריכת הפרטים המלאים של הקורס."
              : "שם, תיאור ורמה בעברית הם שדה חובה — שאר הפרטים אופציונליים."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-4 overflow-y-auto" noValidate>
          {/* ── ליבה (תמיד גלויה) ── */}
          <div>
            <label htmlFor="course-nameHe" className="mb-1.5 block text-sm font-medium text-neutral-300">
              שם הקורס (עברית)
            </label>
            <input id="course-nameHe" className={inputClass} {...register("nameHe")} autoFocus />
            {errors.nameHe && <p className="mt-1 text-sm text-red-400">{errors.nameHe.message}</p>}
          </div>

          <div>
            <label htmlFor="course-descriptionHe" className="mb-1.5 block text-sm font-medium text-neutral-300">
              תיאור קצר (עברית)
            </label>
            <textarea id="course-descriptionHe" className={textareaClass} {...register("descriptionHe")} />
            {errors.descriptionHe && <p className="mt-1 text-sm text-red-400">{errors.descriptionHe.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="course-levelHe" className="mb-1.5 block text-sm font-medium text-neutral-300">
                רמה (עברית)
              </label>
              <input id="course-levelHe" className={inputClass} {...register("levelHe")} />
              {errors.levelHe && <p className="mt-1 text-sm text-red-400">{errors.levelHe.message}</p>}
            </div>
            <div>
              <label htmlFor="course-durationHe" className="mb-1.5 block text-sm font-medium text-neutral-300">
                משך (עברית)
              </label>
              <input id="course-durationHe" className={inputClass} {...register("durationHe")} />
              {errors.durationHe && <p className="mt-1 text-sm text-red-400">{errors.durationHe.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="course-priceShekels" className="mb-1.5 block text-sm font-medium text-neutral-300">
                מחיר מלא (₪, ריק = תדמיתי)
              </label>
              <input id="course-priceShekels" className={inputClass} placeholder="1200" {...register("priceShekels")} />
              {errors.priceShekels && <p className="mt-1 text-sm text-red-400">{errors.priceShekels.message}</p>}
            </div>
            <div>
              <label htmlFor="course-depositPercent" className="mb-1.5 block text-sm font-medium text-neutral-300">
                מקדמה (%, 0 = תשלום מלא)
              </label>
              <input
                id="course-depositPercent"
                type="number"
                className={inputClass}
                {...register("depositPercent", { valueAsNumber: true })}
              />
              {errors.depositPercent && <p className="mt-1 text-sm text-red-400">{errors.depositPercent.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="course-capacity" className="mb-1.5 block text-sm font-medium text-neutral-300">
              מספר מקומות (ריק = ללא הגבלה)
            </label>
            <input
              id="course-capacity"
              type="number"
              className={inputClass}
              {...register("capacity", { setValueAs: (v) => (v === "" || v == null ? undefined : Number(v)) })}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-neutral-300">
            <input type="checkbox" {...register("active")} />
            פעיל (מוצג באתר)
          </label>

          {/* ── תרגומים ותוכן (מתקפל) ── */}
          <CollapsibleSection title="תרגומים ותוכן" open={contentOpen} onToggle={() => setContentOpen((v) => !v)}>
            <div>
              <label htmlFor="course-nameEn" className="mb-1.5 block text-sm font-medium text-neutral-300">
                שם (אנגלית)
              </label>
              <input id="course-nameEn" className={inputClass} {...register("nameEn")} />
            </div>
            <div>
              <label htmlFor="course-nameAr" className="mb-1.5 block text-sm font-medium text-neutral-300">
                שם (ערבית)
              </label>
              <input id="course-nameAr" className={inputClass} {...register("nameAr")} />
            </div>
            <div>
              <label htmlFor="course-descriptionEn" className="mb-1.5 block text-sm font-medium text-neutral-300">
                תיאור (אנגלית)
              </label>
              <textarea id="course-descriptionEn" className={textareaClass} {...register("descriptionEn")} />
            </div>
            <div>
              <label htmlFor="course-descriptionAr" className="mb-1.5 block text-sm font-medium text-neutral-300">
                תיאור (ערבית)
              </label>
              <textarea id="course-descriptionAr" className={textareaClass} {...register("descriptionAr")} />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="course-levelEn" className="mb-1.5 block text-sm font-medium text-neutral-300">
                  רמה (אנגלית)
                </label>
                <input id="course-levelEn" className={inputClass} {...register("levelEn")} />
              </div>
              <div>
                <label htmlFor="course-levelAr" className="mb-1.5 block text-sm font-medium text-neutral-300">
                  רמה (ערבית)
                </label>
                <input id="course-levelAr" className={inputClass} {...register("levelAr")} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="course-durationEn" className="mb-1.5 block text-sm font-medium text-neutral-300">
                  משך (אנגלית)
                </label>
                <input id="course-durationEn" className={inputClass} {...register("durationEn")} />
              </div>
              <div>
                <label htmlFor="course-durationAr" className="mb-1.5 block text-sm font-medium text-neutral-300">
                  משך (ערבית)
                </label>
                <input id="course-durationAr" className={inputClass} {...register("durationAr")} />
              </div>
            </div>
            <div>
              <label htmlFor="course-detailsHe" className="mb-1.5 block text-sm font-medium text-neutral-300">
                הסבר מפורט (עברית)
              </label>
              <textarea id="course-detailsHe" className={textareaClass} {...register("detailsHe")} />
            </div>
            <div>
              <label htmlFor="course-detailsEn" className="mb-1.5 block text-sm font-medium text-neutral-300">
                הסבר מפורט (אנגלית)
              </label>
              <textarea id="course-detailsEn" className={textareaClass} {...register("detailsEn")} />
            </div>
            <div>
              <label htmlFor="course-detailsAr" className="mb-1.5 block text-sm font-medium text-neutral-300">
                הסבר מפורט (ערבית)
              </label>
              <textarea id="course-detailsAr" className={textareaClass} {...register("detailsAr")} />
            </div>
            <div>
              <label htmlFor="course-syllabusHe" className="mb-1.5 block text-sm font-medium text-neutral-300">
                סילבוס (עברית, שורה לכל נושא)
              </label>
              <textarea id="course-syllabusHe" className={textareaClass} {...register("syllabusHe")} />
            </div>
            <div>
              <label htmlFor="course-syllabusEn" className="mb-1.5 block text-sm font-medium text-neutral-300">
                סילבוס (אנגלית)
              </label>
              <textarea id="course-syllabusEn" className={textareaClass} {...register("syllabusEn")} />
            </div>
            <div>
              <label htmlFor="course-syllabusAr" className="mb-1.5 block text-sm font-medium text-neutral-300">
                סילבוס (ערבית)
              </label>
              <textarea id="course-syllabusAr" className={textareaClass} {...register("syllabusAr")} />
            </div>
          </CollapsibleSection>

          {/* ── SEO ותזמון פרסום (מתקפל) ── */}
          <CollapsibleSection title="SEO ותזמון פרסום" open={seoOpen} onToggle={() => setSeoOpen((v) => !v)}>
            <div>
              <label htmlFor="course-publishAt" className="mb-1.5 block text-sm font-medium text-neutral-300">
                תזמון פרסום
              </label>
              <input id="course-publishAt" type="datetime-local" className={inputClass} {...register("publishAt")} />
              <p className="mt-1 text-xs text-neutral-500">מוצג בשעון ישראל; ריק = מתפרסם מיד עם ההפעלה</p>
              {errors.publishAt && <p className="mt-1 text-sm text-red-400">{errors.publishAt.message}</p>}
            </div>
            <div>
              <label htmlFor="course-seoTitleHe" className="mb-1.5 block text-sm font-medium text-neutral-300">
                כותרת SEO (עברית)
              </label>
              <input id="course-seoTitleHe" className={inputClass} {...register("seoTitleHe")} />
              {errors.seoTitleHe && <p className="mt-1 text-sm text-red-400">{errors.seoTitleHe.message}</p>}
            </div>
            <div>
              <label htmlFor="course-seoDescriptionHe" className="mb-1.5 block text-sm font-medium text-neutral-300">
                תיאור SEO (עברית)
              </label>
              <textarea id="course-seoDescriptionHe" className={textareaClass} {...register("seoDescriptionHe")} />
              {errors.seoDescriptionHe && (
                <p className="mt-1 text-sm text-red-400">{errors.seoDescriptionHe.message}</p>
              )}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="course-seoTitleEn" className="mb-1.5 block text-sm font-medium text-neutral-300">
                  כותרת SEO (אנגלית)
                </label>
                <input id="course-seoTitleEn" className={inputClass} {...register("seoTitleEn")} />
              </div>
              <div>
                <label htmlFor="course-seoTitleAr" className="mb-1.5 block text-sm font-medium text-neutral-300">
                  כותרת SEO (ערבית)
                </label>
                <input id="course-seoTitleAr" className={inputClass} {...register("seoTitleAr")} />
              </div>
            </div>
            <div>
              <label htmlFor="course-seoDescriptionEn" className="mb-1.5 block text-sm font-medium text-neutral-300">
                תיאור SEO (אנגלית)
              </label>
              <textarea id="course-seoDescriptionEn" className={textareaClass} {...register("seoDescriptionEn")} />
            </div>
            <div>
              <label htmlFor="course-seoDescriptionAr" className="mb-1.5 block text-sm font-medium text-neutral-300">
                תיאור SEO (ערבית)
              </label>
              <textarea id="course-seoDescriptionAr" className={textareaClass} {...register("seoDescriptionAr")} />
            </div>
          </CollapsibleSection>

          <SheetFooter>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(buttonVariants({ size: "lg", variant: "light" }), "w-full justify-center")}
            >
              {isSubmitting ? "שומר..." : course ? "שמירת שינויים" : "יצירת קורס"}
            </button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
