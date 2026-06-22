"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, type SignInInput } from "@/lib/auth-schema";
import { signIn } from "@/server/actions/auth";
import { buttonVariants } from "@/components/ui/button";
import { cn, safeRedirectPath } from "@/lib/utils";

const inputClass =
  "w-full rounded-md border border-line-dark bg-ink-soft px-4 py-2.5 text-white placeholder:text-neutral-500 focus:border-accent focus:outline-none";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({ resolver: zodResolver(signInSchema) });

  async function onSubmit(values: SignInInput) {
    setServerError(null);
    try {
      const result = await signIn(values);
      if (result.ok) {
        router.push(safeRedirectPath(searchParams.get("next"), "/account"));
        router.refresh();
      } else {
        setServerError(result.error);
      }
    } catch {
      setServerError("אירעה תקלה, נסו שוב");
    }
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

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-neutral-300">
          סיסמה
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
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
        className={cn(buttonVariants({ size: "lg", variant: "light" }), "w-full")}
      >
        {isSubmitting ? "מתחבר..." : "התחברות"}
      </button>
    </form>
  );
}
