import type { Metadata } from "next";
import { getSiteSettings, getOpeningHours } from "@/server/actions/admin/site-settings";
import { siteConfig } from "@/lib/config";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { OpeningHoursForm } from "@/components/admin/opening-hours-form";

export const metadata: Metadata = { title: "הגדרות אתר | ניהול" };
export const dynamic = "force-dynamic";

const DEFAULT_DAYS = [
  { dayOrder: 0, dayHe: "ראשון" },
  { dayOrder: 1, dayHe: "שני" },
  { dayOrder: 2, dayHe: "שלישי" },
  { dayOrder: 3, dayHe: "רביעי" },
  { dayOrder: 4, dayHe: "חמישי" },
  { dayOrder: 5, dayHe: "שישי" },
  { dayOrder: 6, dayHe: "שבת" },
] as const;

export default async function AdminSettingsPage() {
  const [settings, hours] = await Promise.all([getSiteSettings(), getOpeningHours()]);

  const initialSettings = settings ?? {
    phone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
    address: siteConfig.contact.address,
    whatsapp: siteConfig.contact.whatsapp,
    instagramUrl: "",
    facebookUrl: "",
    appStoreUrl: siteConfig.booking.appStore,
    googlePlayUrl: siteConfig.booking.googlePlay,
  };

  const initialHours =
    hours.length > 0
      ? hours
      : DEFAULT_DAYS.map((d) => ({
          ...d,
          dayEn: "",
          dayAr: "",
          hoursHe: "",
          hoursEn: "",
          hoursAr: "",
        }));

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-2xl font-semibold">הגדרות אתר</h1>
        <p className="mt-1 text-neutral-400">פרטי קשר וקישורים שמוצגים בכל האתר.</p>
        <div className="mt-6 max-w-xl">
          <SiteSettingsForm
            initialValues={{
              phone: initialSettings.phone,
              email: initialSettings.email,
              address: initialSettings.address,
              whatsapp: initialSettings.whatsapp,
              instagramUrl: initialSettings.instagramUrl ?? "",
              facebookUrl: initialSettings.facebookUrl ?? "",
              appStoreUrl: initialSettings.appStoreUrl ?? "",
              googlePlayUrl: initialSettings.googlePlayUrl ?? "",
            }}
          />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold">שעות פתיחה</h2>
        <p className="mt-1 text-neutral-400">עברית חובה, אנגלית/ערבית אופציונלי.</p>
        <div className="mt-6">
          <OpeningHoursForm
            initialValues={initialHours.map((h) => ({
              dayOrder: h.dayOrder,
              dayHe: h.dayHe,
              dayEn: h.dayEn ?? "",
              dayAr: h.dayAr ?? "",
              hoursHe: h.hoursHe,
              hoursEn: h.hoursEn ?? "",
              hoursAr: h.hoursAr ?? "",
            }))}
          />
        </div>
      </div>
    </div>
  );
}
