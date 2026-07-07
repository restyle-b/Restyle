"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { ShieldCheck } from "lucide-react";
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
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EnrollInput>({
    resolver: zodResolver(schema),
    defaultValues: { courseId, plan: depositAvailable ? "DEPOSIT" : "FULL" },
  });

  const selectedPlan = watch("plan");

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
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6" noValidate>
      <input type="hidden" {...register("courseId")} />

      <div className="space-y-5">
        <h2 className="font-display text-sm font-semibold tracking-wide text-neutral-300 uppercase">
          {t("contactSectionTitle")}
        </h2>

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
      </div>

      <fieldset className="space-y-3">
        <legend className="font-display text-sm font-semibold tracking-wide text-neutral-300 uppercase">
          {t("planLabel")}
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {depositAvailable && (
            <label
              className={cn(
                "relative flex cursor-pointer flex-col gap-2 rounded-lg border p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-ink",
                selectedPlan === "DEPOSIT"
                  ? "border-accent bg-accent/10"
                  : "border-line-dark bg-ink-soft/60 hover:border-neutral-500",
              )}
            >
              <input
                type="radio"
                value="DEPOSIT"
                className="sr-only"
                {...register("plan", { onChange: clearServerError })}
              />
              <span className="text-sm font-semibold text-white">{t("planDepositTitle")}</span>
              <span className="text-xs leading-relaxed text-neutral-400">{t("planDepositDescription")}</span>
              <div className="mt-2 space-y-1 border-t border-line-dark pt-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-neutral-400">{t("dueNowLabel")}</span>
                  <span className="text-sm font-semibold text-accent">{formatAgorot(depositAgorot, locale)}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-neutral-500">{t("balanceLaterLabel")}</span>
                  <span className="text-xs text-neutral-400">
                    {formatAgorot(priceAgorot - depositAgorot, locale)}
                  </span>
                </div>
              </div>
            </label>
          )}

          <label
            className={cn(
              "relative flex cursor-pointer flex-col gap-2 rounded-lg border p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-ink",
              selectedPlan === "FULL"
                ? "border-accent bg-accent/10"
                : "border-line-dark bg-ink-soft/60 hover:border-neutral-500",
            )}
          >
            <input
              type="radio"
              value="FULL"
              className="sr-only"
              {...register("plan", { onChange: clearServerError })}
            />
            <span className="text-sm font-semibold text-white">{t("planFullTitle")}</span>
            <span className="text-xs leading-relaxed text-neutral-400">{t("planFullDescription")}</span>
            <div className="mt-2 space-y-1 border-t border-line-dark pt-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-neutral-400">{t("dueNowLabel")}</span>
                <span className="text-sm font-semibold text-accent">{formatAgorot(priceAgorot, locale)}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-neutral-500">{t("noBalanceLabel")}</span>
              </div>
            </div>
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

      <div className="space-y-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(buttonVariants({ size: "lg", variant: "light" }), "w-full justify-center")}
        >
          {isSubmitting ? t("submitting") : t("submit")}
        </button>
        <p className="flex items-start gap-1.5 text-xs leading-relaxed text-neutral-500">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {t("nextStepNote")}
        </p>
      </div>
    </form>
  );
}
