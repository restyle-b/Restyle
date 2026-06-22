"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, type SignUpInput } from "@/lib/auth-schema";
import { signUp } from "@/server/actions/auth";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-md border border-line-dark bg-ink-soft px-4 py-2.5 text-white placeholder:text-neutral-500 focus:border-accent focus:outline-none";

export function RegisterForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({ resolver: zodResolver(signUpSchema) });

  async function onSubmit(values: SignUpInput) {
    setServerError(null);
    const result = await signUp(values);
    if (result.ok) {
      setStatus("success");
    } else {
      setStatus("error");
      setServerError(result.error);
    }
  }

  if (status === "success") {
    return (
      <p className="rounded-md border border-accent bg-ink-soft p-6 text-center text-white">
        נרשמת בהצלחה! נשלח אליך מייל לאימות הכתובת — לחצו על הקישור כדי להמשיך.
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
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-neutral-300">
          סיסמה
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          className={inputClass}
          {...register("password")}
        />
        {errors.password && (
          <p className="mt-1.5 text-sm text-red-400">{errors.password.message}</p>
        )}
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
        className={cn(buttonVariants({ size: "lg", variant: "light" }), "w-full")}
      >
        {isSubmitting ? "נרשם..." : "הרשמה"}
      </button>
    </form>
  );
}
