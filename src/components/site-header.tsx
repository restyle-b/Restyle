import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { buttonVariants } from "@/components/ui/button";
import { BookingLink } from "@/components/booking-link";
import { Wordmark } from "@/components/wordmark";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { navLinks } from "@/lib/config";

export function SiteHeader() {
  const t = useTranslations("nav");

  return (
    <header className="sticky top-0 z-50 border-b border-line-dark bg-ink/80 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="text-white" aria-label={t("homeAria")}>
          <Wordmark className="h-8" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label={t("mainAria")}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-neutral-300 transition-colors hover:text-white"
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <LocaleSwitcher className="hidden sm:inline-flex" />
          <BookingLink className={buttonVariants({ size: "sm", className: "hidden sm:inline-flex" })}>
            {t("bookingCta")}
          </BookingLink>
        </div>
      </Container>
    </header>
  );
}
