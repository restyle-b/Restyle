"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocale, useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/section-heading";
import { EnrollmentStatusBadge } from "@/components/courses/enrollment-status-badge";
import { PayBalanceButton } from "@/components/courses/pay-balance-button";
import { lookupEnrollment, type EnrollmentView } from "@/server/actions/courses/lookup-enrollment";
import { formatAgorot } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-md border border-line-dark bg-ink-soft px-4 py-2.5 text-white placeholder:text-neutral-500 focus:border-accent focus:outline-none";

type LookupInput = { enrollmentNumber: string; guestLookupToken: string };

export default function CourseLookupPage() {
  const t = useTranslations("academyCommerce.lookup");
  const tBalance = useTranslations("academyCommerce.balance");
  const locale = useLocale();
  const [serverError, setServerError] = useState<string | null>(null);
  const [result, setResult] = useState<{ enrollment: EnrollmentView; token: string } | null>(null);

  const schema = useMemo(
    () =>
      z.object({
        enrollmentNumber: z.string().trim().min(1, t("errors.numberRequired")).max(20),
        guestLookupToken: z.string().trim().min(1, t("errors.tokenRequired")).max(64),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LookupInput>({ resolver: zodResolver(schema) });

  async function onSubmit(values: LookupInput) {
    setServerError(null);
    setResult(null);
    const res = await lookupEnrollment(values, locale);
    if (res.ok) {
      setResult({ enrollment: res.enrollment, token: res.guestLookupToken });
    } else {
      setServerError(res.error);
    }
  }

  const balance = result ? result.enrollment.coursePriceAgorot - result.enrollment.amountPaidAgorot : 0;

  return (
    <Container className="py-20 sm:py-28">
      <SectionHeading light eyebrow={t("title")} title={t("title")} description={t("description")} />

      {!result && (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-10 max-w-md space-y-5" noValidate>
          <div>
            <label htmlFor="enrollmentNumber" className="mb-1.5 block text-sm font-medium text-neutral-300">
              {t("numberLabel")}
            </label>
            <input id="enrollmentNumber" className={inputClass} {...register("enrollmentNumber")} />
            {errors.enrollmentNumber && (
              <p className="mt-1.5 text-sm text-red-400">{errors.enrollmentNumber.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="guestLookupToken" className="mb-1.5 block text-sm font-medium text-neutral-300">
              {t("tokenLabel")}
            </label>
            <input id="guestLookupToken" className={inputClass} {...register("guestLookupToken")} />
            {errors.guestLookupToken && (
              <p className="mt-1.5 text-sm text-red-400">{errors.guestLookupToken.message}</p>
            )}
          </div>
          {serverError && (
            <p className="text-sm text-red-400" role="alert">
              {serverError}
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(buttonVariants({ size: "lg", variant: "light" }), "w-full sm:w-auto")}
          >
            {isSubmitting ? t("submitting") : t("submit")}
          </button>
        </form>
      )}

      {result && (
        <div className="mt-10 max-w-md rounded-lg border border-line-dark bg-ink-soft p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium text-white">{result.enrollment.courseName}</p>
              <p className="text-sm text-neutral-400">{result.enrollment.enrollmentNumber}</p>
            </div>
            <EnrollmentStatusBadge status={result.enrollment.status} />
          </div>
          <p className="mt-4 text-sm text-neutral-300">
            {tBalance("dueLabel")}:{" "}
            <span className="font-medium text-accent">
              {balance > 0 ? formatAgorot(balance, locale) : tBalance("paidInFull")}
            </span>
          </p>
          {result.enrollment.status === "DEPOSIT_PAID" && balance > 0 && (
            <PayBalanceButton
              enrollmentNumber={result.enrollment.enrollmentNumber}
              guestLookupToken={result.token}
              className="mt-4"
            />
          )}
        </div>
      )}
    </Container>
  );
}
