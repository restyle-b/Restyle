"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  requestPasswordResetSchema,
  type RequestPasswordResetInput,
} from "@/lib/auth-schema";
import { requestPasswordReset } from "@/server/actions/auth";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-md border border-line-dark bg-ink-soft px-4 py-2.5 text-white placeholder:text-neutral-500 focus:border-accent focus:outline-none";

export function ForgotPasswordForm() {
  const [status, setStatus] = useState<"idle" | "success">("idle");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RequestPasswordResetInput>({ resolver: zodResolver(requestPasswordResetSchema) });

  async function onSubmit(values: RequestPasswordResetInput) {
    try {
      await requestPasswordReset(values);
    } catch {
      // requestPasswordReset לא חושף אם המייל קיים — לא חושפים גם פה
      // אם הבקשה נכשלה ברמת התשתית; תמיד מציגים את אותה הודעת הצלחה.
    }
    setStatus("success");
  }

  if (status === "success") {
    return (
      <p className="rounded-md border border-accent bg-ink-soft p-6 text-center text-white">
        אם הכתובת קיימת במערכת, נשלח אליה מייל לאיפוס הסיסמה.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-neutral-300">
          אימייל
        </label>
        <input id="email" type="email" className={inputClass} {...register("email")} />
        {errors.email && <p className="mt-1.5 text-sm text-red-400">{errors.email.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(buttonVariants({ size: "lg", variant: "light" }), "w-full")}
      >
        {isSubmitting ? "שולח..." : "שליחת קישור איפוס"}
      </button>
    </form>
  );
}
