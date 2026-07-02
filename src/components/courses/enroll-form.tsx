"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { createEnrollSchema, type EnrollInput } from "@/lib/courses/enrollment-schema";
import { createEnrollment } from "@/server/actions/courses/create-enrollment";
import { formatAgorot } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-md border border-line-dark bg-ink-soft px-4 py-2.5 text-white placeholder:text-neutral-500 focus:border-accent focus:outline-none";

export function EnrollForm({
  courseId,
  priceAgorot,
  depositAgorot,
  depositAvailable,
}: {
  courseId: string;
  priceAgorot: number;
  depositAgorot: number;
  depositAvailable: boolean;
}) {
  const t = useTranslations("academyCommerce.enroll");
  const locale = useLocale();
  const [serverError, setServerError] = useState<string | null>(null);

  const schema = useMemo(
    () =>
      createEnrollSchema({
        nameTooShort: t("errors.nameTooShort"),
        emailInvalid: t("errors.emailInvalid"),
        phoneTooShort: t("errors.phoneTooShort"),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EnrollInput>({
    resolver: zodResolver(schema),
    defaultValues: { courseId, plan: depositAvailable ? "DEPOSIT" : "FULL" },
  });

  function clearServerError() {
    if (serverError) setServerError(null);
  }

  async function onSubmit(values: EnrollInput) {
    setServerError(null);
    const result = await createEnrollment(values, locale);
    if (!result.ok) {
      setServerError(result.error);
      return;
    }
    window.location.href = result.paymentRedirectUrl;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
      <h2 className="font-display text-lg font-semibold text-white">{t("title")}</h2>
      <input type="hidden" {...register("courseId")} />

      <div>
        <label htmlFor="customerName" className="mb-1.5 block text-sm font-medium text-neutral-300">
          {t("nameLabel")}
        </label>
        <input
          id="customerName"
          className={inputClass}
          aria-invalid={errors.customerName ? "true" : undefined}
          {...register("customerName", { onChange: clearServerError })}
        />
        {errors.customerName && <p className="mt-1.5 text-sm text-red-400">{errors.customerName.message}</p>}
      </div>

      <div>
        <label htmlFor="customerEmail" className="mb-1.5 block text-sm font-medium text-neutral-300">
          {t("emailLabel")}
        </label>
        <input
          id="customerEmail"
          type="email"
          className={inputClass}
          aria-invalid={errors.customerEmail ? "true" : undefined}
          {...register("customerEmail", { onChange: clearServerError })}
        />
        {errors.customerEmail && <p className="mt-1.5 text-sm text-red-400">{errors.customerEmail.message}</p>}
      </div>

      <div>
        <label htmlFor="customerPhone" className="mb-1.5 block text-sm font-medium text-neutral-300">
          {t("phoneLabel")}
        </label>
        <input
          id="customerPhone"
          type="tel"
          className={inputClass}
          aria-invalid={errors.customerPhone ? "true" : undefined}
          {...register("customerPhone", { onChange: clearServerError })}
        />
        {errors.customerPhone && <p className="mt-1.5 text-sm text-red-400">{errors.customerPhone.message}</p>}
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-neutral-300">{t("planLabel")}</legend>
        <div className="space-y-2">
          {depositAvailable && (
            <label className="flex items-center gap-2 text-sm text-neutral-200">
              <input type="radio" value="DEPOSIT" {...register("plan")} />
              {t("planDeposit", { amount: formatAgorot(depositAgorot, locale) })}
            </label>
          )}
          <label className="flex items-center gap-2 text-sm text-neutral-200">
            <input type="radio" value="FULL" {...register("plan")} />
            {t("planFull", { amount: formatAgorot(priceAgorot, locale) })}
          </label>
        </div>
      </fieldset>

      {/* honeypot */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="company">{t("companyLabel")}</label>
        <input id="company" tabIndex={-1} autoComplete="off" {...register("company")} />
      </div>

      {serverError && (
        <p className="text-sm text-red-400" role="alert">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(buttonVariants({ size: "lg" }), "w-full justify-center sm:w-auto")}
      >
        {isSubmitting ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
