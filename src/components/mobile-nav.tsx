"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { BookingLink } from "@/components/booking-link";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { navLinks } from "@/lib/config";

export function MobileNav() {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? t("closeAria") : t("openAria")}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-300 transition-colors hover:text-white"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-16 z-50 border-b border-line-dark bg-ink px-4 py-6 shadow-lg">
          <nav className="flex flex-col gap-4" aria-label={t("mainAria")}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-base text-neutral-300 transition-colors hover:text-white"
              >
                {t(link.key)}
              </Link>
            ))}
          </nav>

          <div className="mt-6 flex items-center justify-between gap-4 border-t border-line-dark pt-6">
            <LocaleSwitcher />
            <BookingLink className={buttonVariants({ size: "sm" })}>{t("bookingCta")}</BookingLink>
          </div>
        </div>
      )}
    </div>
  );
}
