"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { BookingLink } from "@/components/booking-link";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { CartIconLink } from "@/components/cart/cart-icon-link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Wordmark } from "@/components/wordmark";
import { navLinks } from "@/lib/config";

export function MobileNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  // נועל גלילת רקע כשהתפריט פתוח, סוגר ב-Escape, ולוכד את ה-focus בתוך
  // הפאנל (דפוס dialog נגיש לפי WAI-ARIA) כדי ש-Tab לא יברח לתוכן שמתחת.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button, select, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={t("openAria")}
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-300 transition-colors hover:bg-current/10 hover:text-white"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open &&
        createPortal(
          // מוצמד ל-document.body ולא נשאר תחת ה-header: ל-header יש
          // backdrop-blur (backdrop-filter), שיוצר containing block ל-position:fixed
          // ב-Chromium — בלעדי ה-portal הדיאלוג היה "נכלא" בגובה ה-header במקום
          // לכסות את כל המסך.
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="fixed inset-0 z-[70] flex flex-col bg-ink"
          >
            <div className="grid h-16 shrink-0 grid-cols-[2.25rem_1fr_2.25rem] items-center border-b border-line-dark px-4 sm:px-6">
              <button
                ref={closeButtonRef}
                type="button"
                aria-label={t("closeAria")}
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-300 transition-colors hover:bg-current/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex justify-center text-white"
                aria-label={t("homeAria")}
              >
                <Wordmark className="h-8" />
              </Link>
              <h2 id={titleId} className="sr-only">
                {t("mainAria")}
              </h2>
            </div>

            <nav className="flex-1 overflow-y-auto" aria-label={t("mainAria")}>
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={`block border-b border-line-dark px-4 py-5 text-2xl font-semibold text-white transition-colors hover:text-accent sm:px-6 ${
                      isActive ? "bg-white/5 text-accent" : ""
                    }`}
                  >
                    {t(link.key)}
                  </Link>
                );
              })}
              <Link
                href="/account"
                onClick={() => setOpen(false)}
                aria-current={pathname === "/account" ? "page" : undefined}
                className={`block border-b border-line-dark px-4 py-5 text-2xl font-semibold text-white transition-colors hover:text-accent sm:px-6 ${
                  pathname === "/account" ? "bg-white/5 text-accent" : ""
                }`}
              >
                {t("account")}
              </Link>
            </nav>

            <div className="flex shrink-0 flex-col gap-4 border-t border-line-dark px-4 py-6 sm:px-6">
              <div className="flex items-center justify-between gap-2">
                <ThemeToggle
                  dayLabel={t("themeDay")}
                  nightLabel={t("themeNight")}
                  ariaLabel={t("themeToggleAria")}
                />
                <div className="flex items-center gap-2">
                  <LocaleSwitcher />
                  <CartIconLink />
                </div>
              </div>
              <BookingLink
                className={`${buttonVariants({ size: "sm", variant: "light" })} w-full`}
                onClick={() => setOpen(false)}
              >
                {t("bookingCta")}
              </BookingLink>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
