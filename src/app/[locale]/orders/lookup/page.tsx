"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocale, useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/section-heading";
import { OrderDetailCard, type OrderDetailData } from "@/components/shop/order-detail-card";
import { lookupOrder } from "@/server/actions/shop/lookup-order";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-md border border-line-dark bg-ink-soft px-4 py-2.5 text-white placeholder:text-neutral-500 focus:border-accent focus:outline-none";

type LookupInput = { orderNumber: string; guestLookupToken: string };

export default function OrderLookupPage() {
  const t = useTranslations("orders.lookup");
  const locale = useLocale();
  const [serverError, setServerError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderDetailData | null>(null);

  const schema = useMemo(
    () =>
      z.object({
        orderNumber: z.string().trim().min(1, t("errors.orderNumberRequired")).max(20),
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
    setOrder(null);
    const result = await lookupOrder(values, locale);
    if (result.ok) {
      setOrder(result.order);
    } else {
      setServerError(result.error);
    }
  }

  return (
    <Container className="py-20">
      <SectionHeading light eyebrow={t("title")} title={t("title")} description={t("description")} />

      {!order && (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-10 max-w-md space-y-5" noValidate>
          <div>
            <label htmlFor="orderNumber" className="mb-1.5 block text-sm font-medium text-neutral-300">
              {t("orderNumberLabel")}
            </label>
            <input
              id="orderNumber"
              className={inputClass}
              aria-invalid={errors.orderNumber ? "true" : undefined}
              aria-describedby={errors.orderNumber ? "orderNumber-error" : undefined}
              {...register("orderNumber")}
            />
            {errors.orderNumber && (
              <p id="orderNumber-error" className="mt-1.5 text-sm text-red-400">
                {errors.orderNumber.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="guestLookupToken" className="mb-1.5 block text-sm font-medium text-neutral-300">
              {t("tokenLabel")}
            </label>
            <input
              id="guestLookupToken"
              className={inputClass}
              aria-invalid={errors.guestLookupToken ? "true" : undefined}
              aria-describedby={errors.guestLookupToken ? "guestLookupToken-error" : undefined}
              {...register("guestLookupToken")}
            />
            {errors.guestLookupToken && (
              <p id="guestLookupToken-error" className="mt-1.5 text-sm text-red-400">
                {errors.guestLookupToken.message}
              </p>
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

      {order && (
        <div className="mt-10 max-w-xl">
          <OrderDetailCard order={order} />
        </div>
      )}
    </Container>
  );
}
