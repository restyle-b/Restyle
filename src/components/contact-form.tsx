"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { createContactSchema, type ContactInput } from "@/lib/contact-schema";
import { submitContactForm } from "@/server/actions/contact";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-md border border-line-dark bg-ink-soft px-4 py-2.5 text-white placeholder:text-neutral-500 focus:border-accent focus:outline-none";

export function ContactForm() {
  const t = useTranslations("contactForm");
  const locale = useLocale();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const contactSchema = useMemo(
    () =>
      createContactSchema({
        nameTooShort: t("errors.nameTooShort"),
        emailInvalid: t("errors.emailInvalid"),
        messageTooShort: t("errors.messageTooShort"),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  function clearServerError() {
    if (serverError) setServerError(null);
  }

  async function onSubmit(values: ContactInput) {
    setServerError(null);
    const result = await submitContactForm(values, locale);
    if (result.ok) {
      setStatus("success");
      reset();
    } else {
      setStatus("error");
      setServerError(result.error);
    }
  }

  if (status === "success") {
    return (
      <div className="animate-scale-in flex items-start gap-4 rounded-md border border-accent bg-ink-soft p-6">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-ink">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </span>
        <p className="text-white" role="status">
          {t("successMessage")}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-neutral-300">
          {t("nameLabel")}
        </label>
        <input
          id="name"
          className={inputClass}
          aria-invalid={errors.name ? "true" : undefined}
          aria-describedby={errors.name ? "name-error" : undefined}
          {...register("name", { onChange: clearServerError })}
        />
        {errors.name && (
          <p id="name-error" className="mt-1.5 text-sm text-red-400">
            {errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-neutral-300">
          {t("emailLabel")}
        </label>
        <input
          id="email"
          type="email"
          className={inputClass}
          aria-invalid={errors.email ? "true" : undefined}
          aria-describedby={errors.email ? "email-error" : undefined}
          {...register("email", { onChange: clearServerError })}
        />
        {errors.email && (
          <p id="email-error" className="mt-1.5 text-sm text-red-400">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-neutral-300">
          {t("phoneLabel")}
        </label>
        <input id="phone" type="tel" className={inputClass} {...register("phone", { onChange: clearServerError })} />
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-neutral-300">
          {t("messageLabel")}
        </label>
        <textarea
          id="message"
          rows={5}
          className={inputClass}
          aria-invalid={errors.message ? "true" : undefined}
          aria-describedby={errors.message ? "message-error" : undefined}
          {...register("message", { onChange: clearServerError })}
        />
        {errors.message && (
          <p id="message-error" className="mt-1.5 text-sm text-red-400">
            {errors.message.message}
          </p>
        )}
      </div>

      {/* honeypot — מוסתר ממשתמשים אנושיים, לא חלק מה-tab order */}
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
        className={cn(buttonVariants({ size: "lg", variant: "light" }), "w-full sm:w-auto")}
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
