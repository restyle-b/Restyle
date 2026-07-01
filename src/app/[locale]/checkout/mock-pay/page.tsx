"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/section-heading";
import { formatAgorot } from "@/lib/format";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * עמוד תשלום מדומה — לפיתוח/בדיקות בלבד. פעיל רק כש-PAYMENT_PROVIDER!=="tranzila"
 * (נאכף גם ב-mock-provider.ts וגם ב-API route mock-callback). מדמה את החוויה
 * של iframe תשלום חיצוני: המשתמש בוחר "הצלחה"/"כישלון" ומנותב ל-success/cancel.
 */
export default function MockPayPage() {
  return (
    <Suspense>
      <MockPayContent />
    </Suspense>
  );
}

function MockPayContent() {
  const t = useTranslations("checkout.mockPay");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);

  const orderNumber = searchParams.get("order") ?? "";
  const orderId = searchParams.get("oid") ?? "";
  const providerRef = searchParams.get("ref") ?? "";
  const amountAgorot = Number(searchParams.get("amount") ?? "0");

  async function simulate(outcome: "success" | "failure") {
    setIsProcessing(true);
    try {
      await fetch("/api/payments/mock-callback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId, providerRef, amountAgorot, outcome }),
      });
    } finally {
      const localePrefix = locale === "he" ? "" : `/${locale}`;
      const target = outcome === "success" ? "success" : "cancel";
      window.location.href = `${localePrefix}/checkout/${target}?order=${orderNumber}`;
    }
  }

  return (
    <Container className="py-20">
      <SectionHeading light eyebrow={t("title")} title={t("title")} />
      <p className="mt-4 max-w-md text-neutral-400">{t("description")}</p>

      <dl className="mt-8 max-w-sm space-y-2 text-neutral-300">
        <div className="flex justify-between">
          <dt>{t("orderLabel")}</dt>
          <dd className="font-medium text-white">{orderNumber}</dd>
        </div>
        <div className="flex justify-between">
          <dt>{t("amountLabel")}</dt>
          <dd className="font-medium text-accent">{formatAgorot(amountAgorot, locale)}</dd>
        </div>
      </dl>

      <div className="mt-8 flex flex-wrap gap-4">
        <button
          type="button"
          disabled={isProcessing}
          onClick={() => simulate("success")}
          className={cn(buttonVariants({ size: "lg" }))}
        >
          {isProcessing ? t("processing") : t("successButton")}
        </button>
        <button
          type="button"
          disabled={isProcessing}
          onClick={() => simulate("failure")}
          className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
        >
          {isProcessing ? t("processing") : t("failureButton")}
        </button>
      </div>
    </Container>
  );
}
