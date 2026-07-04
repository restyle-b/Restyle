"use client";

import { Toaster as Sonner } from "sonner";
import { useLocale } from "next-intl";

/**
 * Toaster גלובלי לאתר הציבורי (עד כה לא היה קיים — לא נעשה שימוש ב-toast()
 * בצד הלקוח באתר, רק באדמין). עוקב אחרי כיוון ה-locale; הצבעים משתמשים
 * באותם טוקנים תלויי-theme (bg-ink-soft/border-line-dark/text-white)
 * שכבר הופכים אוטומטית ביום דרך ה-override הגלובלי ב-globals.css.
 */
export function SiteToaster() {
  const locale = useLocale();
  const dir = locale === "en" ? "ltr" : "rtl";

  return (
    <Sonner
      position="top-center"
      dir={dir}
      toastOptions={{
        classNames: {
          toast: "!bg-ink-soft !border !border-line-dark !text-white !shadow-lg",
          description: "!text-neutral-400",
          success: "!text-green-400",
          error: "!text-red-400",
        },
      }}
    />
  );
}
