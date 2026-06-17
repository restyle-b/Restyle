import Link from "next/link";
import { Container } from "@/components/ui/container";
import { buttonVariants } from "@/components/ui/button";
import { navLinks, siteConfig } from "@/lib/config";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[--color-line-dark] bg-ink/80 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="font-display text-2xl font-extrabold tracking-wide text-white">
          {siteConfig.name}
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

        <a
          href={siteConfig.booking.web}
          className={buttonVariants({ size: "sm", className: "hidden sm:inline-flex" })}
        >
          קביעת תור
        </a>
      </Container>
    </header>
  );
}
