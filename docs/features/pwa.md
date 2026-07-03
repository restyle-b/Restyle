# PWA — שני אפליקציות נפרדות מאותו קוד

> מסמך תכנון. נוצר 2026-07-03 (בקשת המשתמש: "Make pwa for the website and
> for the admin"). מקור אמת להתקדמות: `ROADMAP.md`.

## הקשר

האתר הציבורי (`src/app/[locale]/*`) והאדמין (`src/app/admin/*`) הם שני עצי
`<html>` נפרדים לגמרי — **אין** `src/app/layout.tsx` משותף (אומת:
`find src/app -maxdepth 1` לא מחזיר layout.tsx בכלל). כל אחד מרנדר `<html>`
משלו. המשמעות: אלה למעשה שתי "אפליקציות" נפרדות מבחינת המשתמש, ולכן שתי
התקנות PWA נפרדות — סמל, שם וscope שונים לכל אחת — ולא PWA אחד "עם שני
מצבים".

## החלטות ארכיטקטוניות

### 1. Manifest — שני קבצים סטטיים, לא `app/manifest.ts`
Next.js תומך ב-`app/manifest.ts` כ-file convention מובנה, אבל זה מתועד
כקובץ ב-**שורש** ה-app, ואין אישור ברור שהוא נתמך כ-nested override לכל
route segment (כמו ש-`icon.tsx`/`opengraph-image.tsx` כן נתמכים). מכיוון
שיש כאן שני עצי `<html>` עצמאיים, טעות בעדיפות/scope תגרום ל-manifest של
אפליקציה אחת "לדלוף" לשנייה בשקט — סיכון לא שווה את החיסכון. הפתרון: שני
קבצים **סטטיים** ב-`public/` (`site.webmanifest`, `admin.webmanifest`),
מקושרים במפורש דרך שדה `metadata.manifest` המובנה (Next Metadata API) בכל
אחד מה-layouts בנפרד — חד-משמעי, בלי תלות בהתנהגות לא-מתועדת.

### 2. Service Worker — `serwist`/`@serwist/next`, לא נכתב ידנית
זה אתר עם Supabase Auth, תשלומים (mock/Tranzila) ואדמין — SW שכותב cache
לא נכון לעמוד checkout/account/admin הוא סיכון אבטחה/נכונות אמיתי (מחיר
ישן מוצג מה-cache, מצב auth ישן, נתוני אדמין מאוחסנים במכשיר משותף).
Fetch-routing ידני (if/else על `event.request.url`) הוא בדיוק סוג הקוד
שקל לפספס בו edge-case. `serwist` (ה-fork המתוחזק של next-pwa, נבנה
ספציפית ל-App Router, TypeScript) נותן תצורה **דקלרטיבית** של אסטרטגיה
לפי route pattern — קל יותר לבדוק/לסקור (כל חוק scope הוא שורה אחת), על
בסיס Workbox הבדוק. שני service workers נפרדים (לא אחד "עם תנאים"):
`/sw.js` בscope `"/"` לאתר הציבורי, `/admin-sw.js` בscope `"/admin/"`
לאדמין — ה-scope הספציפי יותר "מנצח" עבור בקשות תחת `/admin`, כך שהם
עצמאיים לגמרי (תואם: כמה service workers על אותו origin נתמך ב-spec לפי
אורך ה-scope path).

### 3. כללי Cache לפי קבוצת נתיבים
| נתיבים | אסטרטגיה | נימוק |
|---|---|---|
| `/_next/static/*`, פונטים, תמונות סטטיות | CacheFirst | immutable (content-hash בשם הקובץ) |
| דפי שיווק (`/`, `/about`, `/gallery`, `/contact`, `/locations`, `/academy`, `/accessibility`, `/privacy`, `/terms`) | StaleWhileRevalidate | תוכן לא-רגיש, משתנה לעיתים רחוקות, שימושי אופליין |
| `/shop`, `/shop/[slug]` | NetworkFirst | מחיר/מלאי אמיתיים — קודם רשת תמיד; cache רק כ-fallback אמיתי לאופליין |
| `/cart`, `/checkout*`, `/account/*`, `/api/*`, `/auth/*` | **NetworkOnly** | session/תשלום/PII — לעולם לא ב-Cache Storage |
| `/admin/*` (הכל) | **NetworkOnly** | נתוני לקוחות/הזמנות מאובטחים; מכשיר עשוי להיות משותף |

ה-SW של האדמין לא שומר cache לדפים/API בכלל — תפקידו היחיד הוא לספק
"fetch handler" כדי לעמוד בקריטריון ה-installability של Chrome; מותר לו
cache-first רק לסמלים/manifest הסטטיים של האדמין עצמו.

### 4. סמלים (icons)
`public/restyle-logo.png` הוא wordmark מלבני (574×172) — לא מתאים לסמל
ריבועי. `src/app/icon.svg` (32×32, רקע `#0e0e0e` פינות מעוגלות + "R" ב-
`#e5e5e5`) כן מתאים — אותה שפה ויזואלית כמו ה-favicon הקיים. נדרש:
- ציבורי: 192/512 (purpose "any") + 192/512 maskable (ריבוע full-bleed
  בלי עיגול פינות, האות מוקטנת מעט כדי להישאר ב-safe zone ~80%) +
  apple-touch-icon 180×180.
- אדמין: **אותם גדלים**, אבל **צבעים הפוכים** (רקע accent בהיר, אות ink
  כהה) — כדי שיהיו ניתנים להבחנה כשתי אפליקציות מותקנות בנפרד על אותו
  מכשיר (task switcher / מסך בית).
- ייווצרו ע"י Playwright (render ה-SVG בדפדפן אמיתי בגודל מדויק + צילום
  מסך) — כבר מותקן בסביבה, בלי תלות חדשה רק בשביל ייצור אייקונים.

## קריטריוני קבלה
1. שני manifest נפרדים (`site.webmanifest`/`admin.webmanifest`), כל אחד
   מקושר רק ל-layout שלו (`[locale]`/`admin`), עם name/short_name/
   theme_color/start_url/scope נכונים.
2. סמלים בכל הגדלים הנדרשים (192/512 any + maskable) + apple-touch-icon,
   לכל אחת מהאפליקציות בנפרד, מבחינים ויזואלית בין השתיים.
3. שני service workers עצמאיים (scope `/` מול `/admin/`), רשומים רק
   מה-layout הרלוונטי.
4. `/cart`, `/checkout*`, `/account/*`, `/api/*`, `/auth/*`, וכל `/admin/*`
   — Cache Storage **ריק** לנתיבים האלה אחרי גלישה רגילה (מאומת ידנית).
5. דף שיווק (למשל `/about`) עדיין נגיש כש-offline אחרי ביקור ראשון
   (בדיקה ידנית: DevTools → Offline).
6. אין regression ב-CSP הקיים (SW/manifest לא נחסמים); נוספו
   `worker-src`/`manifest-src` מפורשים לביטחון (גם אם `default-src 'self'`
   כבר מכסה fallback).
7. `npx tsc --noEmit && npm run lint && npm test && npm run build` ירוקים.
8. סקירת `security` — 0 Critical/High, מיקוד על נכונות ה-scope/caching.

## פירוק משימות
- קבוצה 1 — סמלים + manifests (ייצור אייקונים, שני קבצי manifest, קישור
  דרך `metadata.manifest` + meta תגי iOS בכל layout).
- קבוצה 2 — service workers (`serwist`+`@serwist/next`, שני קבצי SW עם
  האסטרטגיות מהטבלה, רישום מה-layouts, שינויי `next.config.ts`).
- קבוצה 3 — אבטחה + QA + עדכון ROADMAP (סקירת caching-scope, בדיקה ידנית
  של Cache Storage בנתיבים רגישים, offline fallback, כל השערים ירוקים).
