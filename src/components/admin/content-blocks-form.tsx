"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { contentBlocksSchema, type ContentBlockInput } from "@/lib/admin/content-schema";
import { updateContentBlocks } from "@/server/actions/admin/content";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const formSchema = z.object({ rows: contentBlocksSchema });
type FormValues = { rows: ContentBlockInput[] };

const inputClass =
  "w-full rounded-md border border-line-dark bg-ink-soft px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-accent focus:outline-none";
const textareaClass = cn(inputClass, "min-h-[100px]");

export function ContentBlocksForm({
  namespace,
  initialValues,
}: {
  namespace: string;
  initialValues: ContentBlockInput[];
}) {
  const [serverMessage, setServerMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { rows: initialValues },
  });

  async function onSubmit(values: FormValues) {
    setServerMessage(null);
    const result = await updateContentBlocks(namespace, values.rows);
    setServerMessage(
      result.ok ? { ok: true, text: "נשמר בהצלחה" } : { ok: false, text: result.error },
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="space-y-6">
        {initialValues.map((row, index) => (
          <div key={row.key} className="rounded-lg border border-line-dark p-4">
            <p className="mb-3 font-mono text-xs text-neutral-500">{row.key}</p>
            <input type="hidden" {...register(`rows.${index}.key`)} />
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-300">עברית</label>
                <textarea className={textareaClass} {...register(`rows.${index}.valueHe`)} />
                {errors.rows?.[index]?.valueHe && (
                  <p className="mt-1 text-sm text-red-400">{errors.rows[index]?.valueHe?.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                  אנגלית (אופציונלי — נופל לעברית אם ריק)
                </label>
                <textarea className={textareaClass} {...register(`rows.${index}.valueEn`)} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                  ערבית (אופציונלי — נופל לעברית אם ריק)
                </label>
                <textarea className={textareaClass} {...register(`rows.${index}.valueAr`)} />
              </div>
            </div>
          </div>
        ))}
      </div>

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
