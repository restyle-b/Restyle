import { getTranslations } from "next-intl/server";
import { getContactLinks } from "@/lib/contact-links";
import type { Locale } from "@/i18n/routing";
import type { SiteContactInfo } from "@/lib/content/get-site-settings";
import { cn } from "@/lib/utils";

/** שורת לחצני יצירת קשר מהירה — וייז, טלפון, וואטסאפ. */
export async function ContactActions({
  className,
  locale,
  contact,
}: {
  className?: string;
  locale: Locale;
  contact: SiteContactInfo;
}) {
  const t = await getTranslations({ locale, namespace: "contactActions" });
  const contactLinks = getContactLinks(t("whatsappMessage"), locale, contact);

  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      <a
        href={contactLinks.waze}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-lg border border-line-dark bg-ink-soft px-4 py-2 text-sm font-medium text-white transition-colors hover:border-accent"
      >
        <WazeIcon className="h-5 w-5 text-accent" />
        {t("waze")}
      </a>

      <a
        href={contactLinks.tel}
        className="inline-flex items-center gap-2 rounded-lg border border-line-dark bg-ink-soft px-4 py-2 text-sm font-medium text-white transition-colors hover:border-accent"
      >
        <PhoneIcon className="h-5 w-5 text-accent" />
        {t("call")}
      </a>

      <a
        href={contactLinks.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        <WhatsAppIcon className="h-5 w-5" />
        {t("whatsapp")}
      </a>
    </div>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M6.62 10.79a15.5 15.5 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24 11.4 11.4 0 0 0 3.57.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.24 1.02l-2.2 2.2z" />
    </svg>
  );
}

function WazeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M21 10.5c0-4.7-4.2-8.5-9.3-8.5C6.9 2 3 5.6 3 10c0 1.6.5 3 1.4 4.3.3.5.5 1 .4 1.6l-.3 1.7c-.1.7.5 1.3 1.2 1.1l2-.6c.4-.1.8-.1 1.2.1 1 .4 2 .6 3.1.6 1.4 0 2.7-.3 3.9-.8M9 22a2 2 0 1 0 0-.01M16 22a2 2 0 1 0 0-.01" />
      <circle cx="9.2" cy="9.5" r="1.1" />
      <circle cx="14.8" cy="9.5" r="1.1" />
      <path d="M9 13c.8 1 2 1.5 3 1.5s2.2-.5 3-1.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
