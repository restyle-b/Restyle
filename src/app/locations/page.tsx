import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { BookingLink } from "@/components/booking-link";
import { ContactActions } from "@/components/contact-actions";
import { contactLinks } from "@/lib/contact-links";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "מיקום ושעות",
  description: `מספרת ReStyle — ${siteConfig.contact.address}. שעות פעילות ופרטי הגעה.`,
};

const mapSrc = contactLinks.mapEmbed;

export default function LocationsPage() {
  return (
    <Container className="py-20">
      <SectionHeading
        eyebrow="בואו לבקר"
        title="מיקום ושעות פתיחה"
        description="נשמח לראותכם. הנה כל מה שצריך כדי להגיע אלינו."
      />

      <div className="mt-12 grid items-start gap-12 lg:grid-cols-2">
        <div className="space-y-8 text-neutral-300">
          <div>
            <h2 className="font-display text-lg font-bold text-white">כתובת</h2>
            <p className="mt-2">{siteConfig.contact.address}</p>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold text-white">שעות פעילות</h2>
            <dl className="mt-3 space-y-2">
              {siteConfig.hours.map((row) => (
                <div key={row.day} className="flex justify-between gap-6 border-b border-line-dark pb-2">
                  <dt>{row.day}</dt>
                  <dd className="text-neutral-400">{row.hours}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold text-white">יצירת קשר</h2>
            <dl className="mt-3 space-y-2">
              <div className="flex gap-3">
                <dt className="font-medium text-white">טלפון:</dt>
                <dd>
                  <a href={`tel:${siteConfig.contact.phone}`} className="hover:text-accent">
                    {siteConfig.contact.phone}
                  </a>
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="font-medium text-white">אימייל:</dt>
                <dd>
                  <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-accent">
                    {siteConfig.contact.email}
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h2 className="font-display text-lg font-bold text-white">יצירת קשר מהירה</h2>
            <ContactActions className="mt-3" />
          </div>

          <BookingLink className={buttonVariants({ size: "lg" })}>קביעת תור באפליקציה</BookingLink>
        </div>

        <div className="overflow-hidden rounded-lg border border-line-dark">
          <iframe
            src={mapSrc}
            title={`מפה — ${siteConfig.contact.address}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            sandbox="allow-scripts allow-same-origin allow-popups"
            className="h-[420px] w-full"
          />
        </div>
      </div>
    </Container>
  );
}
