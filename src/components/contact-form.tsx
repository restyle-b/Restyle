"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactInput } from "@/lib/contact-schema";
import { submitContactForm } from "@/server/actions/contact";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-md border border-[--color-line-dark] bg-[--color-ink-soft] px-4 py-2.5 text-white placeholder:text-neutral-500 focus:border-[--color-accent] focus:outline-none";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  async function onSubmit(values: ContactInput) {
    setServerError(null);
    const result = await submitContactForm(values);
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
      <p className="rounded-md border border-[--color-accent] bg-[--color-ink-soft] p-6 text-white">
        ההודעה נשלחה בהצלחה! נחזור אליכם בקרוב.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-neutral-300">
          שם מלא
        </label>
        <input id="name" className={inputClass} {...register("name")} />
        {errors.name && <p className="mt-1.5 text-sm text-red-400">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-neutral-300">
          אימייל
        </label>
        <input id="email" type="email" className={inputClass} {...register("email")} />
        {errors.email && <p className="mt-1.5 text-sm text-red-400">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-neutral-300">
          טלפון (אופציונלי)
        </label>
        <input id="phone" type="tel" className={inputClass} {...register("phone")} />
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-neutral-300">
          הודעה
        </label>
        <textarea id="message" rows={5} className={inputClass} {...register("message")} />
        {errors.message && <p className="mt-1.5 text-sm text-red-400">{errors.message.message}</p>}
      </div>

      {/* honeypot — מוסתר ממשתמשים אנושיים, לא חלק מה-tab order */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="company">חברה</label>
        <input id="company" tabIndex={-1} autoComplete="off" {...register("company")} />
      </div>

      {serverError && <p className="text-sm text-red-400">{serverError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
      >
        {isSubmitting ? "שולח..." : "שליחה"}
      </button>
    </form>
  );
}
