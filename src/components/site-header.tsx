"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { buttonVariants } from "@/components/ui/button";
import { BookingLink } from "@/components/booking-link";
import { Wordmark } from "@/components/wordmark";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { CartIconLink } from "@/components/cart/cart-icon-link";
import { AccountIconLink } from "@/components/account/account-icon-link";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { navLinks } from "@/lib/config";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const isRtl = locale !== "en";
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
      <Container
        className={cn(
          "relative flex h-16 items-center justify-between",
          // במובייל בלבד: היגיון ה-RTL/LTR הפוך מהותית (בקשת המשתמש) —
          // הלוגו והכפתורים מתחלפים בצד שלהם בין עברית/ערבית לאנגלית.
          // ב-md+ הסדר הרגיל (לפי dir של הדף) חוזר לתוקף.
          isRtl ? "max-md:[direction:ltr]" : "max-md:[direction:rtl]",
        )}
      >
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
          {/* במובייל השורה העליונה נשארת רק ללוגו+עגלה+המבורגר (בקשת המשתמש —
              עומס חזותי); שאר הפריטים (מצב יום/לילה, שפה, קביעת תור) עדיין
              נגישים בתוך תפריט ההמבורגר, ואזור אישי נגיש דרך קישור בתפריט. */}
          <div className="hidden md:block">
            <ThemeToggle
              dayLabel={t("themeDay")}
              nightLabel={t("themeNight")}
              ariaLabel={t("themeToggleAria")}
            />
          </div>
          <LocaleSwitcher className="hidden md:inline-flex" />
          <AccountIconLink className="hidden h-9 w-9 items-center justify-center rounded-full text-neutral-300 transition-colors hover:bg-current/10 hover:text-white md:flex" />
          <CartIconLink />
          <BookingLink className={cn(buttonVariants({ size: "sm", variant: "light" }), "hidden md:inline-flex")}>
            {t("bookingCta")}
          </BookingLink>
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
