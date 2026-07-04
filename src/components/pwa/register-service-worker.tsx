"use client";

import { useEffect } from "react";

/**
 * רישום ידני (לא האוטומטי של @serwist/next — register:false ב-next.config.ts)
 * כי יש כאן שני עצי <html> עצמאיים (אתר ציבורי + אדמין) שכל אחד צריך scope
 * משלו על אותו קובץ SW מקומפל (src/app/sw.ts קורא את ה-scope בזמן ריצה כדי
 * להחליט אסטרטגיית caching — ראה docs/features/pwa.md).
 */
export function RegisterServiceWorker({ scope }: { scope: "/" | "/admin" }) {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope }).catch((err) => {
      console.error("[pwa] service worker registration failed:", err);
    });
  }, [scope]);

  return null;
}
