"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updatePasswordSchema, type UpdatePasswordInput } from "@/lib/auth-schema";
import { updatePassword } from "@/server/actions/auth";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-md border border-line-dark bg-ink-soft px-4 py-2.5 text-white placeholder:text-neutral-500 focus:border-accent focus:outline-none";

export function ResetPasswordForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePasswordInput>({ resolver: zodResolver(updatePasswordSchema) });

  async function onSubmit(values: UpdatePasswordInput) {
    setServerError(null);
    const result = await updatePassword(values);
    if (result.ok) {
      router.push("/account");
      router.refresh();
    } else {
      setServerError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-neutral-300">
          סיסמה חדשה
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

      {serverError && <p className="text-sm text-red-400">{serverError}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(buttonVariants({ size: "lg" }), "w-full")}
      >
        {isSubmitting ? "מעדכן..." : "עדכון סיסמה"}
      </button>
    </form>
  );
}
