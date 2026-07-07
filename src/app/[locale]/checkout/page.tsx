"use client";

import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/section-heading";
import { Link } from "@/i18n/navigation";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { useCart } from "@/lib/cart/cart-context";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CheckoutPage() {
  const t = useTranslations("checkout");
  const { items } = useCart();

  return (
    <Container className="py-20">
      <SectionHeading light eyebrow={t("title")} title={t("title")} />

      {items.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-neutral-400">{t("emptyCartDescription")}</p>
          <Link href="/shop" className={cn(buttonVariants({ size: "lg", variant: "light" }), "mt-6")}>
            {t("backToShop")}
          </Link>
        </div>
      ) : (
        <div className="mt-10 max-w-xl">
          <CheckoutForm />
        </div>
      )}
    </Container>
  );
}
