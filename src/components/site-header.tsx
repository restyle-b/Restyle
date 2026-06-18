import Link from "next/link";
import { Container } from "@/components/ui/container";
import { buttonVariants } from "@/components/ui/button";
import { BookingLink } from "@/components/booking-link";
import { Wordmark } from "@/components/wordmark";
import { navLinks } from "@/lib/config";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line-dark bg-ink/80 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="text-white" aria-label="Restyle — לדף הבית">
          <Wordmark className="text-3xl font-bold tracking-wide" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="ניווט ראשי">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-neutral-300 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <BookingLink className={buttonVariants({ size: "sm", className: "hidden sm:inline-flex" })}>
          קביעת תור
        </BookingLink>
      </Container>
    </header>
  );
}
