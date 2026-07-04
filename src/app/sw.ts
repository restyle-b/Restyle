import { defaultCache } from "@serwist/next/worker";
import { NetworkFirst, NetworkOnly, Serwist, StaleWhileRevalidate } from "serwist";
import type { PrecacheEntry, RuntimeCaching, SerwistGlobalConfig } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

/**
 * SW אחד מקומפל, רשום פעמיים בscope שונה (ראה register-service-worker.tsx):
 * "/" מהאתר הציבורי, "/admin" מהאדמין. ה-scope בזמן ריצה (לא build-time)
 * קובע את אסטרטגיית ה-caching — כך אין תלות בקומפילציית webpack נפרדת לכל אפליקציה.
 * ראה docs/features/pwa.md לטבלת ההחלטות המלאה.
 */
const isAdminScope = self.registration.scope.includes("/admin");

// לעולם לא ל-cache — session/תשלום/PII/נתוני אדמין. חייב להיות **לפני**
// defaultCache במערך (first-match-wins), כי ל-defaultCache יש NetworkFirst
// גורף ל-/api/* ולעמודי HTML שהיה "תופס" את הנתיבים האלה קודם.
const neverCache: RuntimeCaching[] = [
  {
    // מסיר prefix locale אופציונלי (/en, /ar — עברית ללא prefix) לפני ההשוואה,
    // כדי שנתיב אחד יכסה את כל השפות. "auth" תמיד ללא prefix (מחוץ ל-[locale]).
    // "courses" כולל /courses/success ו-/courses/cancel — force-dynamic, מציגים
    // enrollmentNumber/status/יתרה לתשלום שנשלפים מה-DB בזמן render; בלי החרגה
    // כאן היו נופלים ל-marketingCaching (StaleWhileRevalidate) ונשמרים ב-Cache
    // Storage — אותה בעיה בדיוק שבגללה cart/checkout/account מוחרגים.
    matcher: ({ url }) => {
      const path = url.pathname.replace(/^\/(en|ar)(?=\/|$)/, "");
      return /^\/(cart|checkout|account|auth|courses)(\/|$)/.test(path);
    },
    handler: new NetworkOnly(),
  },
  {
    matcher: ({ url }) => url.pathname.startsWith("/api/"),
    handler: new NetworkOnly(),
  },
];

// מחיר/מלאי אמיתיים — תמיד רשת קודם; cache רק כ-fallback אמיתי לאופליין.
const shopCaching: RuntimeCaching = {
  matcher: ({ url }) => /^\/(en\/|ar\/)?shop(\/|$)/.test(url.pathname),
  handler: new NetworkFirst({ cacheName: "shop-pages", networkTimeoutSeconds: 5 }),
};

// דפי שיווק — תוכן לא-רגיש, משתנה לעיתים רחוקות, שימושי אופליין.
const marketingCaching: RuntimeCaching = {
  matcher: ({ request, sameOrigin }) => sameOrigin && request.mode === "navigate",
  handler: new StaleWhileRevalidate({ cacheName: "marketing-pages" }),
};

const publicRuntimeCaching: RuntimeCaching[] = [...neverCache, shopCaching, marketingCaching, ...defaultCache];

// האדמין: NetworkOnly גורף לכל דבר — בלי יוצא מן הכלל. תפקיד ה-SW כאן הוא
// רק לספק fetch handler לצורך קריטריון ה-installability, לא caching בפועל
// (נתוני לקוחות/הזמנות מאובטחים, המכשיר עשוי להיות משותף).
const adminRuntimeCaching: RuntimeCaching[] = [{ matcher: () => true, handler: new NetworkOnly() }];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: isAdminScope ? adminRuntimeCaching : publicRuntimeCaching,
});

serwist.addEventListeners();
