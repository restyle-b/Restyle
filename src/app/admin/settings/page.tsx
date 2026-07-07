import type { Metadata } from "next";
import { Suspense } from "react";
import { getSiteSettings, getOpeningHoursAdmin } from "@/server/actions/admin/site-settings";
import { siteConfig } from "@/lib/config";
import { SettingsTabs } from "@/components/admin/settings-tabs";

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

const DEFAULT_SHIPPING_FEE_AGOROT = 4000;
const DEFAULT_LOW_STOCK_THRESHOLD = 5;

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

  const shippingFeeAgorot = settings?.shippingFeeAgorot ?? DEFAULT_SHIPPING_FEE_AGOROT;
  const lowStockThreshold = settings?.lowStockThreshold ?? DEFAULT_LOW_STOCK_THRESHOLD;

  return (
    <div>
      <h1 className="text-2xl font-semibold">הגדרות אתר</h1>
      <p className="mt-1 text-neutral-400">ניהול פרטי האתר, שעות הפתיחה, המשלוח והמלאי.</p>

      <div className="mt-6">
        <Suspense>
          <SettingsTabs
            initialSettings={{
              phone: initialSettings.phone,
              email: initialSettings.email,
              address: initialSettings.address,
              whatsapp: initialSettings.whatsapp,
              instagramUrl: initialSettings.instagramUrl ?? "",
              facebookUrl: initialSettings.facebookUrl ?? "",
              appStoreUrl: initialSettings.appStoreUrl ?? "",
              googlePlayUrl: initialSettings.googlePlayUrl ?? "",
            }}
            initialHours={initialHours}
            initialShipping={{
              shippingFeeShekels: String(shippingFeeAgorot / 100),
              lowStockThreshold: String(lowStockThreshold),
            }}
          />
        </Suspense>
      </div>
    </div>
  );
}
