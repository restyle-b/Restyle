"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { createProfileSchema, type ProfileInput } from "@/lib/account/profile-schema";
import { updateProfile } from "@/server/actions/account/profile";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-md border border-line-dark bg-ink-soft px-4 py-2.5 text-white placeholder:text-neutral-500 focus:border-accent focus:outline-none";

/** טופס עדכון name/phone — אימייל אינו חלק מהטופס הזה (read-only, מוצג ע"י ההורה). */
export function ProfileForm({ initialName, initialPhone }: { initialName: string; initialPhone: string }) {
  const t = useTranslations("account.profile");
  const locale = useLocale();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const schema = useMemo(
    () =>
      createProfileSchema({
        nameTooShort: t("errors.nameTooShort"),
        phoneTooShort: t("errors.phoneTooShort"),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(schema),
    defaultValues: { name: initialName, phone: initialPhone },
  });

  async function onSubmit(values: ProfileInput) {
    setServerError(null);
    const result = await updateProfile(values, locale);
    if (!result.ok) {
      setServerError(result.error);
      return;
    }
    toast.success(t("savedToast"));
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <label htmlFor="profileName" className="mb-1.5 block text-sm font-medium text-neutral-300">
          {t("nameLabel")}
        </label>
        <input
          id="profileName"
          className={inputClass}
          aria-invalid={errors.name ? "true" : undefined}
          aria-describedby={errors.name ? "profileName-error" : undefined}
          {...register("name")}
        />
        {errors.name && (
          <p id="profileName-error" className="mt-1.5 text-sm text-red-400">
            {errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="profilePhone" className="mb-1.5 block text-sm font-medium text-neutral-300">
          {t("phoneLabel")}
        </label>
        <input
          id="profilePhone"
          type="tel"
          inputMode="tel"
          dir="ltr"
          className={cn(inputClass, "text-end")}
          aria-invalid={errors.phone ? "true" : undefined}
          aria-describedby={errors.phone ? "profilePhone-error" : undefined}
          {...register("phone")}
        />
        {errors.phone && (
          <p id="profilePhone-error" className="mt-1.5 text-sm text-red-400">
            {errors.phone.message}
          </p>
        )}
      </div>

      {serverError && (
        <p className="text-sm text-red-400" role="alert">
          {serverError}
        </p>
      )}

      <button type="submit" disabled={isSubmitting} className={cn(buttonVariants({ variant: "light", size: "sm" }))}>
        {isSubmitting ? t("saving") : t("saveCta")}
      </button>
    </form>
  );
}
