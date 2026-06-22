"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { buttonVariants } from "@/components/ui/button";
import { BookingLink } from "@/components/booking-link";
import { Wordmark } from "@/components/wordmark";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { navLinks } from "@/lib/config";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  // scrolled = עברנו את ראש העמוד (מוסיף רקע מלא+צל); hidden = להסתיר בגלילה מטה.
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 8);
        // מסתירים רק בגלילה מטה אחרי סף; תמיד מציגים סמוך לראש או בגלילה מעלה.
        if (y > 160 && y > lastY + 4) setHidden(true);
        else if (y < lastY - 4 || y < 160) setHidden(false);
        lastY = y;
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b backdrop-blur transition-[transform,background-color,border-color,box-shadow] duration-300 ease-out",
        scrolled
          ? "border-line-dark header-scrolled shadow-lg shadow-black/20"
          : "header-top border-transparent",
        hidden && "-translate-y-full",
      )}
    >
      <Container className="relative flex h-16 items-center justify-between">
        <Link href="/" className="text-white" aria-label={t("homeAria")}>
          <Wordmark className="h-8" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label={t("mainAria")}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "link-underline text-sm transition-colors hover:text-white",
                  isActive ? "is-active text-white" : "text-neutral-300",
                )}
              >
                {t(link.key)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle
            dayLabel={t("themeDay")}
            nightLabel={t("themeNight")}
            ariaLabel={t("themeToggleAria")}
          />
          <LocaleSwitcher className="hidden md:inline-flex" />
          <BookingLink className={buttonVariants({ size: "sm", variant: "light" })}>
            {t("bookingCta")}
          </BookingLink>
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
