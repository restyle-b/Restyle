"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { OpeningHoursForm } from "@/components/admin/opening-hours-form";
import { ShippingSettingsForm } from "@/components/admin/shipping-settings-form";
import type {
  SiteSettingsInput,
  OpeningHourInput,
  ShippingSettingsInput,
} from "@/lib/admin/site-settings-schema";
import { cn } from "@/lib/utils";

type TabId = "general" | "hours" | "shipping";

const TABS: { id: TabId; label: string; description: string }[] = [
  {
    id: "general",
    label: "כללי ופרטי קשר",
    description: "פרטי קשר וקישורים שמוצגים בכל האתר.",
  },
  {
    id: "hours",
    label: "שעות פתיחה",
    description: "שעות זהות בכל השפות — לסמן \"סגור\" ליום חופש.",
  },
  {
    id: "shipping",
    label: "משלוח ומלאי",
    description: "דמי המשלוח בעגלה וסף ההתראה על מלאי נמוך.",
  },
];

function isTabId(value: string | null): value is TabId {
  return value === "general" || value === "hours" || value === "shipping";
}

/**
 * IA של דף ההגדרות (B6 ב-ux-spec) — טאבים על נתיב יחיד /admin/settings, עם
 * ?tab= ניתן לקישור-עומק (deep-link). רצועת ה-pill-chip תואמת חזותית את
 * ProductsTable (סינון מלאי). מגן "שינויים שלא נשמרו" מבוסס react-hook-form
 * isDirty לכל טופס — לא היה קיים דפוס דומה בקוד קודם לכן, ראה הערה למטה.
 */
export function SettingsTabs({
  initialSettings,
  initialHours,
  initialShipping,
}: {
  initialSettings: SiteSettingsInput;
  initialHours: OpeningHourInput[];
  initialShipping: ShippingSettingsInput;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<TabId>(isTabId(tabParam) ? tabParam : "general");
  const [dirty, setDirty] = useState<Record<TabId, boolean>>({
    general: false,
    hours: false,
    shipping: false,
  });

  // ניווט back/forward בדפדפן משנה את ה-URL "מבחוץ" — מסנכרנים את הטאב הפעיל
  // בלי לתפוס את activeTab עצמו בתלויות (זה היה יוצר לולאה).
  useEffect(() => {
    const next = searchParams.get("tab");
    if (isTabId(next)) {
      setActiveTab((prev) => (prev === next ? prev : next));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // מגן "יש שינויים שלא נשמרו" לסגירת טאב/רענון הדפדפן — לא נמצא דפוס דומה
  // בקוד אחר בפרויקט (בדקנו Sheet/form components תחת src/components/admin),
  // אז זהו implementation ראשון מסוגו: beforeunload סטנדרטי + window.confirm
  // בעת מעבר בין הטאבים עצמם (למטה ב-selectTab).
  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (Object.values(dirty).some(Boolean)) {
        event.preventDefault();
        event.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  const selectTab = useCallback(
    (next: TabId) => {
      if (next === activeTab) return;
      if (dirty[activeTab] && !window.confirm("יש שינויים שלא נשמרו. לעבור בכל זאת?")) {
        return;
      }
      setActiveTab(next);
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", next);
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [activeTab, dirty, router, searchParams],
  );

  const setGeneralDirty = useCallback(
    (value: boolean) => setDirty((prev) => (prev.general === value ? prev : { ...prev, general: value })),
    [],
  );
  const setHoursDirty = useCallback(
    (value: boolean) => setDirty((prev) => (prev.hours === value ? prev : { ...prev, hours: value })),
    [],
  );
  const setShippingDirty = useCallback(
    (value: boolean) => setDirty((prev) => (prev.shipping === value ? prev : { ...prev, shipping: value })),
    [],
  );

  // ה-8 שדות של פרטי הקשר, בלי שני השדות החדשים — נשלחים "כמו שהם" מהטאב
  // השלישי כי updateSiteSettings היא server action משותפת לסינגלטון אחד
  // (ראה shipping-settings-form.tsx).
  const contactFields = {
    phone: initialSettings.phone,
    email: initialSettings.email,
    address: initialSettings.address,
    whatsapp: initialSettings.whatsapp,
    instagramUrl: initialSettings.instagramUrl,
    facebookUrl: initialSettings.facebookUrl,
    appStoreUrl: initialSettings.appStoreUrl,
    googlePlayUrl: initialSettings.googlePlayUrl,
  };

  const activeMeta = TABS.find((tab) => tab.id === activeTab) ?? TABS[0]!;

  return (
    <div>
      <div className="overflow-x-auto">
        <div className="flex w-max items-center gap-2 pb-1 sm:w-auto sm:flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => selectTab(tab.id)}
              aria-current={activeTab === tab.id ? "true" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                activeTab === tab.id
                  ? "border-accent bg-accent text-ink"
                  : "border-line-dark text-neutral-300 hover:bg-white/5",
              )}
            >
              {tab.label}
              {dirty[tab.id] && (
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-current"
                  aria-hidden
                  title="יש שינויים שלא נשמרו"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold">{activeMeta.label}</h2>
        <p className="mt-1 text-neutral-400">{activeMeta.description}</p>

        {activeTab === "general" && (
          <div className="mt-6 max-w-xl">
            <SiteSettingsForm initialValues={initialSettings} onDirtyChange={setGeneralDirty} />
          </div>
        )}
        {activeTab === "hours" && (
          <div className="mt-6">
            <OpeningHoursForm initialValues={initialHours} onDirtyChange={setHoursDirty} />
          </div>
        )}
        {activeTab === "shipping" && (
          <div className="mt-6 max-w-xl">
            <ShippingSettingsForm
              initialValues={initialShipping}
              contactFields={contactFields}
              onDirtyChange={setShippingDirty}
            />
          </div>
        )}
      </div>
    </div>
  );
}
