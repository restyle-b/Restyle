"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  shippingSettingsSchema,
  type ShippingSettingsInput,
  type SiteSettingsInput,
} from "@/lib/admin/site-settings-schema";
import { updateSiteSettings } from "@/server/actions/admin/site-settings";
import { buttonVariants } from "@/components/ui/button";
import { adminInputClassLg as inputClass } from "@/lib/admin/form-styles";
import { cn } from "@/lib/utils";

// שדות פרטי הקשר הקיימים (SiteSettingsForm) — לא מוצגים בטאב הזה, אבל
// updateSiteSettings היא אותה server action עבור כל הטופס-סינגלטון, כך
// שהשליחה כאן "נושאת איתה" את הערכים הנוכחיים שלהם בלי לשנות אותם (round-trip
// של מה שכבר נטען בשרת ל-page.tsx, אותו עיקרון קיים כבר בטופס עצמו).
type ContactFields = Omit<SiteSettingsInput, "shippingFeeShekels" | "lowStockThreshold">;

export function ShippingSettingsForm({
  initialValues,
  contactFields,
  onDirtyChange,
}: {
  initialValues: ShippingSettingsInput;
  contactFields: ContactFields;
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const [serverMessage, setServerMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<ShippingSettingsInput>({
    resolver: zodResolver(shippingSettingsSchema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  async function onSubmit(values: ShippingSettingsInput) {
    setServerMessage(null);
    const result = await updateSiteSettings({ ...contactFields, ...values });
    setServerMessage(
      result.ok ? { ok: true, text: "נשמר בהצלחה" } : { ok: false, text: result.error },
    );
    if (result.ok) reset(values);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label
          htmlFor="shippingFeeShekels"
          className="mb-1.5 block text-sm font-medium text-neutral-300"
        >
          דמי משלוח (בש&quot;ח)
        </label>
        <input
          id="shippingFeeShekels"
          type="text"
          inputMode="decimal"
          className={inputClass}
          {...register("shippingFeeShekels")}
        />
        {errors.shippingFeeShekels && (
          <p className="mt-1.5 text-sm text-red-400">{errors.shippingFeeShekels.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="lowStockThreshold"
          className="mb-1.5 block text-sm font-medium text-neutral-300"
        >
          סף מלאי נמוך (יחידות)
        </label>
        <input
          id="lowStockThreshold"
          type="text"
          inputMode="numeric"
          className={inputClass}
          {...register("lowStockThreshold")}
        />
        {errors.lowStockThreshold && (
          <p className="mt-1.5 text-sm text-red-400">{errors.lowStockThreshold.message}</p>
        )}
      </div>

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
