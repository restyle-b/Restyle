"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { categorySchema, type CategoryInput } from "@/lib/admin/category-schema";
import { updateCategories } from "@/server/actions/admin/categories";
import { buttonVariants } from "@/components/ui/button";
import { ConfirmRemoveButton } from "@/components/admin/confirm-remove-button";
import { adminInputClass as inputClass } from "@/lib/admin/form-styles";
import { cn } from "@/lib/utils";

const formSchema = z.object({ rows: categorySchema.array() });
type FormValues = { rows: CategoryInput[] };

function emptyRow(order: number): CategoryInput {
  return { order, slug: "", nameHe: "", nameEn: "", nameAr: "", active: true };
}

export function CategoriesForm({ initialValues }: { initialValues: CategoryInput[] }) {
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
    const result = await updateCategories(values.rows);
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
              <span className="text-sm text-neutral-400">קטגוריה #{index + 1}</span>
              <ConfirmRemoveButton onRemove={() => remove(index)} />
            </div>
            <input type="hidden" {...register(`rows.${index}.id`)} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                  Slug (אנגלית)
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
                <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                  שם (עברית)
                </label>
                <input className={inputClass} {...register(`rows.${index}.nameHe`)} />
                {errors.rows?.[index]?.nameHe && (
                  <p className="mt-1 text-sm text-red-400">{errors.rows[index]?.nameHe?.message}</p>
                )}
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm text-neutral-300">
                  <input type="checkbox" {...register(`rows.${index}.active`)} />
                  פעילה (מוצגת בחנות)
                </label>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                  שם (אנגלית)
                </label>
                <input className={inputClass} {...register(`rows.${index}.nameEn`)} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                  שם (ערבית)
                </label>
                <input className={inputClass} {...register(`rows.${index}.nameAr`)} />
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
        הוספת קטגוריה
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
