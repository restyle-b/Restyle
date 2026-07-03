import type { Metadata } from "next";
import { getSiteSettings, getOpeningHoursAdmin } from "@/server/actions/admin/site-settings";
import { siteConfig } from "@/lib/config";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { OpeningHoursForm } from "@/components/admin/opening-hours-form";

export const metadata: Metadata = { title: "הגדרות אתר | ניהול" };
export const dynamic = "force-dynamic";

const DEFAULT_DAYS = [
  { dayOrder: 0, closed: false, openTime: "09:00", closeTime: "20:00" },
  { dayOrder: 1, closed: false, openTime: "09:00", closeTime: "20:00" },
  { dayOrder: 2, closed: false, openTime: "09:00", closeTime: "20:00" },
  { dayOrder: 3, closed: false, openTime: "09:00", closeTime: "20:00" },
  { dayOrder: 4, closed: false, openTime: "09:00", closeTime: "20:00" },
  { dayOrder: 5, closed: false, openTime: "09:00", closeTime: "14:00" },
  { dayOrder: 6, closed: true, openTime: "", closeTime: "" },
] as const;

export default async function AdminSettingsPage() {
  const [settings, hours] = await Promise.all([getSiteSettings(), getOpeningHoursAdmin()]);

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
      ? hours.map((h) => ({
          dayOrder: h.dayOrder,
          closed: h.closed,
          openTime: h.openTime ?? "",
          closeTime: h.closeTime ?? "",
        }))
      : DEFAULT_DAYS.map((d) => ({ ...d }));

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
        <p className="mt-1 text-neutral-400">
          שעות זהות בכל השפות — לסמן &quot;סגור&quot; ליום חופש.
        </p>
        <div className="mt-6">
          <OpeningHoursForm initialValues={initialHours} />
        </div>
      </div>
    </div>
  );
}
