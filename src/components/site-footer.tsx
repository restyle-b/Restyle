import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { BookingLink } from "@/components/booking-link";
import { Wordmark } from "@/components/wordmark";
import { navLinks, siteConfig } from "@/lib/config";

export function SiteFooter() {
  const tNav = useTranslations("nav");
  const tLayout = useTranslations("layout");
  const tFooter = useTranslations("footer");

  return (
    <footer className="border-t border-line-dark bg-ink-soft">
      <Container className="grid gap-10 py-14 md:grid-cols-3">
        <div>
          <Wordmark className="h-9" />
          <p className="mt-3 max-w-xs text-sm text-neutral-400">{tLayout("description")}</p>
        </div>

        <nav aria-label={tNav("footerAria")}>
          <h3 className="text-sm font-semibold text-white">{tFooter("navHeading")}</h3>
          <ul className="mt-4 space-y-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-neutral-400 transition-colors hover:text-white"
                >
                  {tNav(link.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="text-sm font-semibold text-white">{tFooter("bookingHeading")}</h3>
          <p className="mt-4 text-sm text-neutral-400">{tFooter("bookingText")}</p>
          <BookingLink className="mt-3 inline-block text-sm font-medium text-accent hover:underline">
            {tFooter("downloadApp")}
          </BookingLink>
        </div>
      </Container>

      <div className="border-t border-line-dark py-6 pb-28 sm:pb-6">
        <Container className="flex flex-col items-center gap-3 text-center text-xs text-neutral-500 sm:flex-row sm:justify-between">
          <span>
            {tFooter("rights", { year: new Date().getFullYear(), name: siteConfig.name })}
          </span>
          <nav aria-label={tFooter("legalAria")} className="flex flex-wrap justify-center gap-4">
            <Link href="/accessibility" className="transition-colors hover:text-white">
              {tFooter("accessibilityStatement")}
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-white">
              {tFooter("privacyPolicy")}
            </Link>
            <Link href="/terms" className="transition-colors hover:text-white">
              {tFooter("terms")}
            </Link>
          </nav>
        </Container>
      </div>
    </footer>
  );
}
