import Link from "next/link";
import { Container } from "@/components/ui/container";
import { navLinks, siteConfig } from "@/lib/config";

export function SiteFooter() {
  return (
    <footer className="border-t border-line-dark bg-ink-soft">
      <Container className="grid gap-10 py-14 md:grid-cols-3">
        <div>
          <div className="font-display text-2xl font-extrabold tracking-wide text-white">
            {siteConfig.name}
          </div>
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
          <a
            href={siteConfig.booking.web}
            className="mt-3 inline-block text-sm font-medium text-accent hover:underline"
          >
            להורדת האפליקציה ←
          </a>
        </div>
      </Container>

      <div className="border-t border-line-dark py-6">
        <Container className="text-center text-xs text-neutral-500">
          © {new Date().getFullYear()} {siteConfig.name}. כל הזכויות שמורות.
        </Container>
      </div>
    </footer>
  );
}
