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
import { adminInputClass } from "@/lib/admin/form-styles";

const formSchema = z.object({ rows: openingHoursSchema });
type FormValues = { rows: OpeningHourInput[] };

const DAY_NAMES = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

export function OpeningHoursForm({ initialValues }: { initialValues: OpeningHourInput[] }) {
  const [serverMessage, setServerMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const {
    register,
    handleSubmit,
    watch,
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
        <table className="w-full min-w-[480px] border-collapse text-right">
          <thead>
            <tr className="text-sm text-neutral-400">
              <th className="p-2 font-medium">יום</th>
              <th className="p-2 font-medium">פתיחה</th>
              <th className="p-2 font-medium">סגירה</th>
              <th className="p-2 font-medium">סגור</th>
            </tr>
          </thead>
          <tbody>
            {initialValues.map((row, index) => {
              const closed = watch(`rows.${index}.closed`);
              return (
                <tr key={row.dayOrder}>
                  <td className="p-2 text-sm text-white">{DAY_NAMES[row.dayOrder]}</td>
                  <td className="p-2">
                    <input
                      type="time"
                      disabled={closed}
                      className={cn(adminInputClass, closed && "opacity-50")}
                      {...register(`rows.${index}.openTime`)}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="time"
                      disabled={closed}
                      className={cn(adminInputClass, closed && "opacity-50")}
                      {...register(`rows.${index}.closeTime`)}
                    />
                  </td>
                  <td className="p-2 text-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      {...register(`rows.${index}.closed`)}
                    />
                  </td>
                  <input
                    type="hidden"
                    {...register(`rows.${index}.dayOrder`, { valueAsNumber: true })}
                  />
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {errors.rows && (
        <p className="text-sm text-red-400">
          יש להזין שעת פתיחה וסגירה לכל יום פתוח, או לסמן &quot;סגור&quot;.
        </p>
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
