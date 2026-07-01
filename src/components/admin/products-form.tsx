"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { productSchema, type ProductInput } from "@/lib/admin/product-schema";
import { updateProducts } from "@/server/actions/admin/products";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const formSchema = z.object({ rows: productSchema.array() });
type FormValues = { rows: ProductInput[] };

const inputClass =
  "w-full rounded-md border border-line-dark bg-ink-soft px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-accent focus:outline-none";

function emptyRow(order: number): ProductInput {
  return {
    order,
    slug: "",
    nameHe: "",
    nameEn: "",
    nameAr: "",
    descriptionHe: "",
    descriptionEn: "",
    descriptionAr: "",
    priceShekels: "",
    stock: 0,
    imageUrl: "",
    categoryId: "",
    active: true,
  };
}

export function ProductsForm({
  initialValues,
  categories,
}: {
  initialValues: ProductInput[];
  categories: { id: string; nameHe: string; slug: string }[];
}) {
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
    const result = await updateProducts(values.rows);
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
              <span className="text-sm text-neutral-400">מוצר #{index + 1}</span>
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
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-300">קטגוריה</label>
                <select className={inputClass} {...register(`rows.${index}.categoryId`)}>
                  <option value="">ללא קטגוריה</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameHe}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                  תיאור (עברית)
                </label>
                <textarea rows={2} className={inputClass} {...register(`rows.${index}.descriptionHe`)} />
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
                <textarea rows={2} className={inputClass} {...register(`rows.${index}.descriptionEn`)} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                  תיאור (ערבית)
                </label>
                <textarea rows={2} className={inputClass} {...register(`rows.${index}.descriptionAr`)} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                  מחיר (₪)
                </label>
                <input
                  className={inputClass}
                  placeholder="49.90"
                  {...register(`rows.${index}.priceShekels`)}
                />
                {errors.rows?.[index]?.priceShekels && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.rows[index]?.priceShekels?.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-300">מלאי</label>
                <input
                  type="number"
                  className={inputClass}
                  {...register(`rows.${index}.stock`, { valueAsNumber: true })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                  כתובת תמונה (URL, אופציונלי)
                </label>
                <input className={inputClass} {...register(`rows.${index}.imageUrl`)} />
                {errors.rows?.[index]?.imageUrl && (
                  <p className="mt-1 text-sm text-red-400">{errors.rows[index]?.imageUrl?.message}</p>
                )}
                {rows?.[index]?.imageUrl && (
                  // תצוגה מקדימה בלבד ב-Admin; ה-URL נבדק כ-http/https ע"י zod.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={rows[index].imageUrl}
                    alt=""
                    className="mt-2 h-24 w-24 rounded-md object-cover"
                  />
                )}
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm text-neutral-300">
                  <input type="checkbox" {...register(`rows.${index}.active`)} />
                  פעיל (מוצג בחנות)
                </label>
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
        הוספת מוצר
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
