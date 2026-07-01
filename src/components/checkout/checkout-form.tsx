"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { createCheckoutSchema, type CheckoutInput } from "@/lib/checkout/checkout-schema";
import { createOrder } from "@/server/actions/shop/create-order";
import { useCart } from "@/lib/cart/cart-context";
import { formatAgorot } from "@/lib/format";
import { DELIVERY_FEE_AGOROT } from "@/lib/checkout/shipping";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-md border border-line-dark bg-ink-soft px-4 py-2.5 text-white placeholder:text-neutral-500 focus:border-accent focus:outline-none";

export function CheckoutForm() {
  const t = useTranslations("checkout");
  const locale = useLocale();
  const { items, subtotalAgorot, clear } = useCart();
  const [serverError, setServerError] = useState<string | null>(null);

  const checkoutSchema = useMemo(
    () =>
      createCheckoutSchema({
        nameTooShort: t("errors.nameTooShort"),
        emailInvalid: t("errors.emailInvalid"),
        phoneTooShort: t("errors.phoneTooShort"),
        addressRequired: t("errors.addressRequired"),
        cityRequired: t("errors.cityRequired"),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { deliveryMethod: "PICKUP" },
  });

  const deliveryMethod = watch("deliveryMethod");
  const shippingAgorot = deliveryMethod === "DELIVERY" ? DELIVERY_FEE_AGOROT : 0;
  const totalAgorot = subtotalAgorot + shippingAgorot;

  function clearServerError() {
    if (serverError) setServerError(null);
  }

  async function onSubmit(values: CheckoutInput) {
    setServerError(null);
    const cartInput = items.map((i) => ({ productId: i.productId, quantity: i.quantity }));
    const result = await createOrder(values, cartInput, locale);
    if (!result.ok) {
      setServerError(result.error);
      return;
    }
    // ההזמנה כבר נוצרה ב-DB — מנקים את העגלה כדי למנוע יצירת הזמנה כפולה
    // אם המשתמש חוזר לעמוד הצ'קאאוט. הניווט לתשלום הוא full navigation
    // (window.location) כי redirectUrl עשוי להיות URL חיצוני מלא (Tranzila).
    clear();
    window.location.href = result.paymentRedirectUrl;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
      <div className="space-y-5">
        <h2 className="font-display text-lg font-semibold text-white">{t("contactTitle")}</h2>

        <div>
          <label htmlFor="customerName" className="mb-1.5 block text-sm font-medium text-neutral-300">
            {t("nameLabel")}
          </label>
          <input
            id="customerName"
            className={inputClass}
            aria-invalid={errors.customerName ? "true" : undefined}
            aria-describedby={errors.customerName ? "customerName-error" : undefined}
            {...register("customerName", { onChange: clearServerError })}
          />
          {errors.customerName && (
            <p id="customerName-error" className="mt-1.5 text-sm text-red-400">
              {errors.customerName.message}
            </p>
          )}
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
            aria-describedby={errors.customerEmail ? "customerEmail-error" : undefined}
            {...register("customerEmail", { onChange: clearServerError })}
          />
          {errors.customerEmail && (
            <p id="customerEmail-error" className="mt-1.5 text-sm text-red-400">
              {errors.customerEmail.message}
            </p>
          )}
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
            aria-describedby={errors.customerPhone ? "customerPhone-error" : undefined}
            {...register("customerPhone", { onChange: clearServerError })}
          />
          {errors.customerPhone && (
            <p id="customerPhone-error" className="mt-1.5 text-sm text-red-400">
              {errors.customerPhone.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-5">
        <h2 className="font-display text-lg font-semibold text-white">{t("deliveryTitle")}</h2>

        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-neutral-300">
            <input type="radio" value="PICKUP" {...register("deliveryMethod", { onChange: clearServerError })} />
            {t("deliveryPickup")}
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-300">
            <input type="radio" value="DELIVERY" {...register("deliveryMethod", { onChange: clearServerError })} />
            {t("deliveryDelivery")}
          </label>
        </div>

        {deliveryMethod === "DELIVERY" && (
          <div className="space-y-5">
            <div>
              <label htmlFor="addressLine" className="mb-1.5 block text-sm font-medium text-neutral-300">
                {t("addressLineLabel")}
              </label>
              <input
                id="addressLine"
                className={inputClass}
                aria-invalid={errors.addressLine ? "true" : undefined}
                aria-describedby={errors.addressLine ? "addressLine-error" : undefined}
                {...register("addressLine", { onChange: clearServerError })}
              />
              {errors.addressLine && (
                <p id="addressLine-error" className="mt-1.5 text-sm text-red-400">
                  {errors.addressLine.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="addressCity" className="mb-1.5 block text-sm font-medium text-neutral-300">
                {t("addressCityLabel")}
              </label>
              <input
                id="addressCity"
                className={inputClass}
                aria-invalid={errors.addressCity ? "true" : undefined}
                aria-describedby={errors.addressCity ? "addressCity-error" : undefined}
                {...register("addressCity", { onChange: clearServerError })}
              />
              {errors.addressCity && (
                <p id="addressCity-error" className="mt-1.5 text-sm text-red-400">
                  {errors.addressCity.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="addressNotes" className="mb-1.5 block text-sm font-medium text-neutral-300">
                {t("addressNotesLabel")}
              </label>
              <textarea id="addressNotes" rows={3} className={inputClass} {...register("addressNotes")} />
            </div>
          </div>
        )}
      </div>

      {/* honeypot — מוסתר ממשתמשים אנושיים, לא חלק מה-tab order */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="company">{t("companyLabel")}</label>
        <input id="company" tabIndex={-1} autoComplete="off" {...register("company")} />
      </div>

      <div className="space-y-2 border-t border-line-dark pt-5">
        <h2 className="font-display text-lg font-semibold text-white">{t("summaryTitle")}</h2>
        <div className="flex items-center justify-between text-sm text-neutral-300">
          <span>{t("subtotalLabel")}</span>
          <span>{formatAgorot(subtotalAgorot, locale)}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-neutral-300">
          <span>{t("shippingLabel")}</span>
          <span>{shippingAgorot > 0 ? formatAgorot(shippingAgorot, locale) : t("shippingFree")}</span>
        </div>
        <div className="flex items-center justify-between border-t border-line-dark pt-2 text-lg font-semibold text-white">
          <span>{t("totalLabel")}</span>
          <span className="text-accent">{formatAgorot(totalAgorot, locale)}</span>
        </div>
      </div>

      {serverError && (
        <p className="text-sm text-red-400" role="alert">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting || items.length === 0}
        className={cn(buttonVariants({ size: "lg" }), "w-full justify-center")}
      >
        {isSubmitting && (
          <svg
            className="h-4 w-4 animate-spin motion-reduce:animate-none"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M12 2a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7V2z" />
          </svg>
        )}
        {isSubmitting ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
