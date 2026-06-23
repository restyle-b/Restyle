"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { courseSchema, type CourseInput } from "@/lib/admin/courses-schema";
import { updateCourses } from "@/server/actions/admin/courses";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const formSchema = z.object({ rows: courseSchema.array() });
type FormValues = { rows: CourseInput[] };

const inputClass =
  "w-full rounded-md border border-line-dark bg-ink-soft px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-accent focus:outline-none";
const textareaClass = cn(inputClass, "min-h-[80px]");

function emptyRow(order: number): CourseInput {
  return {
    slug: "",
    order,
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
    active: true,
  };
}

export function CoursesForm({ initialValues }: { initialValues: CourseInput[] }) {
  const [serverMessage, setServerMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { rows: initialValues },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "rows" });

  async function onSubmit(values: FormValues) {
    setServerMessage(null);
    const result = await updateCourses(values.rows);
    setServerMessage(
      result.ok ? { ok: true, text: "נשמר בהצלחה" } : { ok: false, text: result.error },
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="space-y-6">
        {fields.map((field, index) => (
          <div key={field.id} className="rounded-lg border border-line-dark p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-neutral-400">קורס #{index + 1}</span>
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-sm text-red-400 hover:text-red-300"
              >
                הסרה
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                  Slug (אנגלית, באתר)
                </label>
                <input className={inputClass} {...register(`rows.${index}.slug`)} />
                {errors.rows?.[index]?.slug && (
                  <p className="mt-1 text-sm text-red-400">{errors.rows[index]?.slug?.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-300">סדר</label>
                <input
                  type="number"
                  className={inputClass}
                  {...register(`rows.${index}.order`, { valueAsNumber: true })}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-300">שם (עברית)</label>
                <input className={inputClass} {...register(`rows.${index}.nameHe`)} />
                {errors.rows?.[index]?.nameHe && (
                  <p className="mt-1 text-sm text-red-400">{errors.rows[index]?.nameHe?.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-300">שם (אנגלית)</label>
                <input className={inputClass} {...register(`rows.${index}.nameEn`)} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-300">שם (ערבית)</label>
                <input className={inputClass} {...register(`rows.${index}.nameAr`)} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                  משך (עברית)
                </label>
                <input className={inputClass} {...register(`rows.${index}.durationHe`)} />
                {errors.rows?.[index]?.durationHe && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.rows[index]?.durationHe?.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                  משך (אנגלית)
                </label>
                <input className={inputClass} {...register(`rows.${index}.durationEn`)} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                  משך (ערבית)
                </label>
                <input className={inputClass} {...register(`rows.${index}.durationAr`)} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                  רמה (עברית)
                </label>
                <input className={inputClass} {...register(`rows.${index}.levelHe`)} />
                {errors.rows?.[index]?.levelHe && (
                  <p className="mt-1 text-sm text-red-400">{errors.rows[index]?.levelHe?.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                  רמה (אנגלית)
                </label>
                <input className={inputClass} {...register(`rows.${index}.levelEn`)} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                  רמה (ערבית)
                </label>
                <input className={inputClass} {...register(`rows.${index}.levelAr`)} />
              </div>
              <div className="sm:col-span-2">
                <label className="flex items-center gap-2 text-sm text-neutral-300">
                  <input type="checkbox" {...register(`rows.${index}.active`)} />
                  פעיל (מוצג באתר)
                </label>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                  תיאור (עברית)
                </label>
                <textarea className={textareaClass} {...register(`rows.${index}.descriptionHe`)} />
                {errors.rows?.[index]?.descriptionHe && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.rows[index]?.descriptionHe?.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                  תיאור (אנגלית)
                </label>
                <textarea className={textareaClass} {...register(`rows.${index}.descriptionEn`)} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                  תיאור (ערבית)
                </label>
                <textarea className={textareaClass} {...register(`rows.${index}.descriptionAr`)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => append(emptyRow(fields.length))}
        className={cn(buttonVariants({ size: "md", variant: "outline" }))}
      >
        הוספת קורס
      </button>

      {serverMessage && (
        <p className={cn("text-sm", serverMessage.ok ? "text-green-400" : "text-red-400")}>
          {serverMessage.text}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(buttonVariants({ size: "lg", variant: "light" }))}
        >
          {isSubmitting ? "שומר..." : "שמירה"}
        </button>
      </div>
    </form>
  );
}
