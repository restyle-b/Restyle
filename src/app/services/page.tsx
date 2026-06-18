import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { BookingLink } from "@/components/booking-link";
import { services } from "@/lib/services-data";

export const metadata: Metadata = {
  title: "שירותים",
  description: "כל שירותי המספרה של ReStyle — תספורות, עיצוב זקן, צבע וטיפולי שיער.",
};

export default function ServicesPage() {
  return (
    <Container className="py-20">
      <SectionHeading eyebrow="מה שאנחנו עושים" title="כל השירותים שלנו" />

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <div
            key={service.slug}
            className="rounded-lg border border-line-dark bg-ink-soft p-6"
          >
            <h2 className="font-display text-lg font-bold text-white">{service.name}</h2>
            <p className="mt-2 text-sm text-neutral-400">{service.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <BookingLink className={buttonVariants({ size: "lg" })}>קביעת תור</BookingLink>
      </div>
    </Container>
  );
}
