"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { payBalance } from "@/server/actions/courses/pay-balance";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * כפתור "תשלום יתרה" — משמש גם באזור האישי (בלי token, בעלות דרך session)
 * וגם ב-guest lookup (עם guestLookupToken). קורא ל-payBalance ומנתב לתשלום.
 */
export function PayBalanceButton({
  enrollmentNumber,
  guestLookupToken,
  className,
}: {
  enrollmentNumber: string;
  guestLookupToken?: string;
  className?: string;
}) {
  const t = useTranslations("academyCommerce.balance");
  const locale = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setIsSubmitting(true);
    setError(null);
    const result = await payBalance({ enrollmentNumber, guestLookupToken }, locale);
    if (result.ok) {
      window.location.href = result.paymentRedirectUrl;
    } else {
      setError(result.error);
      setIsSubmitting(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={onClick}
        disabled={isSubmitting}
        className={cn(buttonVariants({ size: "sm", variant: "light" }))}
      >
        {isSubmitting ? "..." : t("payCta")}
      </button>
      {error && (
        <p className="mt-1.5 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
