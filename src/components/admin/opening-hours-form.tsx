"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  openingHoursSchema,
  type OpeningHourInput,
} from "@/lib/admin/site-settings-schema";
import { updateOpeningHours } from "@/server/actions/admin/site-settings";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const formSchema = z.object({ rows: openingHoursSchema });
type FormValues = { rows: OpeningHourInput[] };

const inputClass =
  "w-full rounded-md border border-line-dark bg-ink-soft px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-accent focus:outline-none";

export function OpeningHoursForm({ initialValues }: { initialValues: OpeningHourInput[] }) {
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
    const result = await updateOpeningHours(values.rows);
    setServerMessage(
      result.ok ? { ok: true, text: "נשמר בהצלחה" } : { ok: false, text: result.error },
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-right">
          <thead>
            <tr className="text-sm text-neutral-400">
              <th className="p-2 font-medium">יום (עברית)</th>
              <th className="p-2 font-medium">יום (אנגלית)</th>
              <th className="p-2 font-medium">יום (ערבית)</th>
              <th className="p-2 font-medium">שעות (עברית)</th>
              <th className="p-2 font-medium">שעות (אנגלית)</th>
              <th className="p-2 font-medium">שעות (ערבית)</th>
            </tr>
          </thead>
          <tbody>
            {initialValues.map((row, index) => (
              <tr key={row.dayOrder}>
                <td className="p-2">
                  <input
                    className={inputClass}
                    {...register(`rows.${index}.dayHe`)}
                  />
                </td>
                <td className="p-2">
                  <input className={inputClass} {...register(`rows.${index}.dayEn`)} />
                </td>
                <td className="p-2">
                  <input className={inputClass} {...register(`rows.${index}.dayAr`)} />
                </td>
                <td className="p-2">
                  <input
                    className={inputClass}
                    placeholder="לדוגמה: 09:00–20:00"
                    {...register(`rows.${index}.hoursHe`)}
                  />
                </td>
                <td className="p-2">
                  <input className={inputClass} {...register(`rows.${index}.hoursEn`)} />
                </td>
                <td className="p-2">
                  <input className={inputClass} {...register(`rows.${index}.hoursAr`)} />
                </td>
                <input
                  type="hidden"
                  {...register(`rows.${index}.dayOrder`, { valueAsNumber: true })}
                />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {errors.rows && (
        <p className="text-sm text-red-400">יש לתקן שדות חובה (עברית) בטבלה.</p>
      )}

      {serverMessage && (
        <p className={cn("text-sm", serverMessage.ok ? "text-green-400" : "text-red-400")}>
          {serverMessage.text}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(buttonVariants({ size: "lg", variant: "light" }))}
      >
        {isSubmitting ? "שומר..." : "שמירה"}
      </button>
    </form>
  );
}
