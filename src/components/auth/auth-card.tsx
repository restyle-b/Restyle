import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/section-heading";

export function AuthCard({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: { href: string; text: string; linkText: string };
}) {
  return (
    <Container className="flex min-h-[60vh] items-center py-20">
      <div className="mx-auto w-full max-w-md">
        <SectionHeading center light eyebrow={eyebrow} title={title} description={description} />
        <div className="mt-8">{children}</div>
        {footer && (
          <p className="mt-6 text-center text-sm text-neutral-400">
            {footer.text}{" "}
            <Link href={footer.href} className="font-medium text-accent hover:underline">
              {footer.linkText}
            </Link>
          </p>
        )}
      </div>
    </Container>
  );
}
