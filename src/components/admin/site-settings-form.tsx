"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { siteSettingsSchema, type SiteSettingsInput } from "@/lib/admin/site-settings-schema";
import { updateSiteSettings } from "@/server/actions/admin/site-settings";
import { buttonVariants } from "@/components/ui/button";
import { adminInputClassLg as inputClass } from "@/lib/admin/form-styles";
import { cn } from "@/lib/utils";

const FIELDS: { name: keyof SiteSettingsInput; label: string; type?: string }[] = [
  { name: "phone", label: "טלפון" },
  { name: "email", label: "אימייל", type: "email" },
  { name: "address", label: "כתובת" },
  { name: "whatsapp", label: "וואטסאפ (בפורמט בינלאומי, בלי +)" },
  { name: "instagramUrl", label: "קישור אינסטגרם", type: "url" },
  { name: "facebookUrl", label: "קישור פייסבוק", type: "url" },
  { name: "appStoreUrl", label: "קישור App Store", type: "url" },
  { name: "googlePlayUrl", label: "קישור Google Play", type: "url" },
];

export function SiteSettingsForm({ initialValues }: { initialValues: SiteSettingsInput }) {
  const [serverMessage, setServerMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SiteSettingsInput>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: initialValues,
  });

  async function onSubmit(values: SiteSettingsInput) {
    setServerMessage(null);
    const result = await updateSiteSettings(values);
    setServerMessage(
      result.ok ? { ok: true, text: "נשמר בהצלחה" } : { ok: false, text: result.error },
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {FIELDS.map((field) => (
        <div key={field.name}>
          <label htmlFor={field.name} className="mb-1.5 block text-sm font-medium text-neutral-300">
            {field.label}
          </label>
          <input
            id={field.name}
            type={field.type ?? "text"}
            className={inputClass}
            {...register(field.name)}
          />
          {errors[field.name] && (
            <p className="mt-1.5 text-sm text-red-400">{errors[field.name]?.message}</p>
          )}
        </div>
      ))}

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
