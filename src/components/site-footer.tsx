import Link from "next/link";
import { Container } from "@/components/ui/container";
import { BookingLink } from "@/components/booking-link";
import { Wordmark } from "@/components/wordmark";
import { navLinks, siteConfig } from "@/lib/config";

export function SiteFooter() {
  return (
    <footer className="border-t border-line-dark bg-ink-soft">
      <Container className="grid gap-10 py-14 md:grid-cols-3">
        <div>
          <Wordmark className="text-3xl font-bold tracking-wide text-white" />
          <p className="mt-3 max-w-xs text-sm text-neutral-400">{siteConfig.description}</p>
        </div>

        <nav aria-label="ניווט תחתון">
          <h3 className="text-sm font-semibold text-white">ניווט</h3>
          <ul className="mt-4 space-y-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-neutral-400 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="text-sm font-semibold text-white">קביעת תור</h3>
          <p className="mt-4 text-sm text-neutral-400">
            קביעת תור מתבצעת באפליקציית Restyle.
          </p>
          <BookingLink className="mt-3 inline-block text-sm font-medium text-accent hover:underline">
            להורדת האפליקציה ←
          </BookingLink>
        </div>
      </Container>

      <div className="border-t border-line-dark py-6">
        <Container className="flex flex-col items-center gap-3 text-center text-xs text-neutral-500 sm:flex-row sm:justify-between">
          <span>
            © {new Date().getFullYear()} {siteConfig.name}. כל הזכויות שמורות.
          </span>
          <nav aria-label="קישורים משפטיים" className="flex flex-wrap justify-center gap-4">
            <Link href="/accessibility" className="transition-colors hover:text-white">
              הצהרת נגישות
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-white">
              מדיניות פרטיות
            </Link>
            <Link href="/terms" className="transition-colors hover:text-white">
              תקנון
            </Link>
          </nav>
        </Container>
      </div>
    </footer>
  );
}
