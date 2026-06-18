import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/section-heading";
import { ContactForm } from "@/components/contact-form";
import { ContactActions } from "@/components/contact-actions";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "צור קשר",
  description: "יש לכם שאלה? השאירו לנו הודעה ונחזור אליכם בהקדם.",
};

export default function ContactPage() {
  return (
    <Container className="py-20">
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <SectionHeading
            light
            eyebrow="יש לכם שאלה?"
            title="צרו קשר"
            description="השאירו לנו הודעה ונחזור אליכם בהקדם. לקביעת תור — דרך אפליקציית Restyle."
          />
          <dl className="mt-8 space-y-3 text-neutral-300">
            <div className="flex gap-3">
              <dt className="font-medium text-white">כתובת:</dt>
              <dd>{siteConfig.contact.address || "יפורסם בקרוב"}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="font-medium text-white">טלפון:</dt>
              <dd>{siteConfig.contact.phone || "יפורסם בקרוב"}</dd>
            </div>
            <div className="flex gap-3">
              <dt className="font-medium text-white">אימייל:</dt>
              <dd>{siteConfig.contact.email || "יפורסם בקרוב"}</dd>
            </div>
          </dl>

          <ContactActions className="mt-8" />
        </div>

        <ContactForm />
      </div>
    </Container>
  );
}
