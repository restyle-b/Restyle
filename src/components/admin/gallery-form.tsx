"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { galleryImageSchema, type GalleryImageInput } from "@/lib/admin/gallery-schema";
import { updateGalleryImages } from "@/server/actions/admin/gallery";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const formSchema = z.object({ rows: galleryImageSchema.array() });
type FormValues = { rows: GalleryImageInput[] };

const inputClass =
  "w-full rounded-md border border-line-dark bg-ink-soft px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-accent focus:outline-none";

function emptyRow(order: number): GalleryImageInput {
  return { order, imageUrl: "", altHe: "", altEn: "", altAr: "", active: true };
}

export function GalleryForm({ initialValues }: { initialValues: GalleryImageInput[] }) {
  const [serverMessage, setServerMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { rows: initialValues },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "rows" });
  const rows = watch("rows");

  async function onSubmit(values: FormValues) {
    setServerMessage(null);
    const result = await updateGalleryImages(values.rows);
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
              <span className="text-sm text-neutral-400">תמונה #{index + 1}</span>
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-sm text-red-400 hover:text-red-300"
              >
                הסרה
              </button>
            </div>
            <input type="hidden" {...register(`rows.${index}.id`)} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                  כתובת תמונה (URL)
                </label>
                <input className={inputClass} {...register(`rows.${index}.imageUrl`)} />
                {errors.rows?.[index]?.imageUrl && (
                  <p className="mt-1 text-sm text-red-400">{errors.rows[index]?.imageUrl?.message}</p>
                )}
                {rows?.[index]?.imageUrl && (
                  // תצוגה מקדימה בלבד ב-Admin; ה-URL נבדק כ-http/https ע"י zod, ואין
                  // remotePatterns ל-next/image (מניעת SSRF, ראה docs/ARCHITECTURE.md §7).
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={rows[index].imageUrl}
                    alt=""
                    className="mt-2 h-24 w-24 rounded-md object-cover"
                  />
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
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm text-neutral-300">
                  <input type="checkbox" {...register(`rows.${index}.active`)} />
                  פעיל (מוצג באתר)
                </label>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                  טקסט חלופי (עברית)
                </label>
                <input className={inputClass} {...register(`rows.${index}.altHe`)} />
                {errors.rows?.[index]?.altHe && (
                  <p className="mt-1 text-sm text-red-400">{errors.rows[index]?.altHe?.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                  טקסט חלופי (אנגלית)
                </label>
                <input className={inputClass} {...register(`rows.${index}.altEn`)} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                  טקסט חלופי (ערבית)
                </label>
                <input className={inputClass} {...register(`rows.${index}.altAr`)} />
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
        הוספת תמונה
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
