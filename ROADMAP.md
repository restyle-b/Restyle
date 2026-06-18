# ROADMAP — Restyle 🪒

> **קובץ מנחה ומקור האמת להתקדמות הפרויקט.**
> מתעד מה כבר עשינו ✅, מה בעבודה 🔄, ומה נשאר ⬜.
> **לעדכן לפני סיום כל סשן** (לפי הוראת המשתמש) + להוסיף רשומה ל-Session Log בתחתית.

מקרא: ✅ הושלם ונבדק (QA) · 🔄 בעבודה · ⬜ לא התחיל · ⏸️ ממתין/חסום

---

## 🚦 להתחיל מכאן בסשן הבא — קריטי!

**מצב (עודכן 2026-06-18):** סדר העדיפויות השתנה — **המוצר שנמסר ראשון הוא אתר תדמית
בלי חנות ובלי הרשמת משתמשים** (ראה "🔀 שני מסלולים" למעלה). Phase 3 (Supabase Auth)
**כבר מומש בקוד, רץ בפרודקשן ב-Vercel, ואומת מול ה-API האמיתי של Supabase** — אבל
שייך כעת להרחבה האופציונלית ולא לעדיפות הנוכחית. **אל תמשיך לפתח Phase 3-8 (auth/
חנות/תשלומים/אקדמיה/אדמין) בלי אישור מפורש מהמשתמש שהלקוח בחר בהרחבה.** העדיפות
הנוכחית: Phase 2 שאריות + Phase 9 (קישורי אפליקציה).

ה-DB עדיין לא מאומת בפועל — ה-sandbox ממשיך לחסום TCP ל-Postgres גם עם "Network
Access: Full" (רק HTTPS עובד). **אל תבזבז זמן בלהילחם בזה** — זה לא חוסם את העדיפות
הנוכחית (מסלול הבסיס לא תלוי ב-DB חי).

**משימה ממתינה קריטית (תלויה ב-TCP או בהרצה ידנית של המשתמש):** יש להריץ ב-Supabase
SQL Editor את `prisma/migrations/20260617010000_auth_sync_and_rls/migration.sql`
(trigger שמסנכרן `auth.users`→`public.users` + RLS) — **בלעדיו הרשמה אמיתית תיכשל
בשקט מבחינת טבלת `users` שלנו** (ה-auth עצמו ב-Supabase יעבוד, אבל השורה ב-`public.users`
לא תיווצר). אחרי הרצה: `npx prisma migrate resolve --applied 20260617010000_auth_sync_and_rls`.

### מה כבר קיים ב-container (לא צריך לשחזר):
- `.env.local` מלא עם 4 הערכים מ-Supabase: `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`
  (פרויקט Supabase: `rgivretfxunsvbeimtnu`, region Frankfurt, pooler חיבור
  transaction על פורט 6543). **קובץ זה לא ב-git** (.gitignore) — אם פותחים
  container חדש מאפס, הוא לא יהיה קיים ויש לבקש מהמשתמש להזין מחדש (ראה
  `docs/SETUP.md`). אומת: `curl https://<project>.supabase.co` מצליח (HTTPS תקין),
  אך `nc` ל-port 6543/5432 נכשל ב-timeout — Postgres TCP חסום בכל הסשנים עד כה.
- Migration ראשונה (`users` table + `Role` enum) — רצה ידנית ב-Supabase SQL
  Editor (לא דרך `prisma migrate`, כי לא הייתה גישת TCP). הקובץ קיים גם
  ב-`prisma/migrations/20260617000000_init/` ונדחף ל-git. **כשתהיה גישת TCP**,
  צריך `npx prisma migrate resolve --applied 20260617000000_init` לפני המשך.
- R2 / Resend — עדיין לא הוקמו. `RESEND_API_KEY` אופציונלי ב-`lib/env.ts`;
  `server/actions/contact.ts` מתנהג כ-fallback (לוג בשרת) כשהוא חסר.
- Vercel — המשתמש עדיין לא אישר חיבור הריפו.
- חבילות חדשות שהותקנו בסשן זה: `react-hook-form`, `@hookform/resolvers`, `resend`.

### צ'קליסט פתיחה לסשן הבא:
1. `git status` ו-`git log -1` — לאשר שה-branch מסונכרן.
2. ודא ש-`.env.local` קיים (`ls -la .env.local`). אם לא — בקש מהמשתמש להזין שוב
   (URL, anon/publishable key, service_role/secret key, סיסמת DB).
3. (אופציונלי, לא חוסם) בדוק חיבור DB: `set -a && source .env.local && set +a &&
   npx prisma migrate status`. אם מצליח — בצע שלב 4 בתיבה הקודמת. אם נכשל —
   תתעלם והמשך בעבודת קוד.
4. המשך **Phase 2** (`docs/TASKS.md` T2.10/T2.15 נותרו: בדיקת נגישות/Lighthouse,
   תמונות אמיתיות כשיתקבלו) ואז **Phase 3** (אימות עם Supabase Auth).

### דברים שעדיין פתוחים מול המשתמש:
- אישור חיבור Vercel↔GitHub (T1.22) + הזנת משתני הסביבה ב-Vercel Settings.
- Cloudflare R2 (bucket + tokens) — לא דחוף עד Phase 4.
- Resend API key אמיתי (יש fallback ללוג כרגע) + `CONTACT_NOTIFICATION_EMAIL`.
- לוגו + תמונות איכותיות למספרה (ל-Hero/גלריה) — כרגע placeholders אפורים.
- ~~קישורי אפליקציית Restyle~~ ✅ הוגדרו ב-`siteConfig.booking` (App Store + Google Play, דרך `BookingLink`).
- ~~פרטי קשר אמיתיים~~ ✅ הוזנו ב-`siteConfig.contact` (חיים לסקוב 4 ת"א, 050-5961800, Restyle.Barbershop@outlook.com).

---

## חזון
אתר מספרה פרימיום (בהשראת menspire.com). **שונה סדר העדיפויות** (2026-06-18): המוצר הבסיסי
שיימסר ראשון הוא **אתר תדמית בלבד — בלי חנות ובלי הרשמת משתמשים**. חנות, אזור אישי
מאובטח, אקדמיה, ניהול הזמנות, ממשק ניהול ותשתית תשלומים הם **הרחבה אופציונלית**
שתופעל רק אם/כשהלקוח יבחר בה (ראה השוואת חלופות ב-[`docs/QUOTE.md`](./docs/QUOTE.md)).

## 🔀 שני מסלולים

| | מסלול בסיס (נמסר ראשון) | הרחבה אופציונלית (לפי בקשת הלקוח) |
|---|---|---|
| **כולל** | דף בית, אודות, שירותים, גלריה, צור קשר, קישור לאפליקציית Restyle לקביעת תור | חנות (Phase 4), תשתית תשלומים (Phase 5), ניהול הזמנות (Phase 6), אקדמיה (Phase 7), אדמין (Phase 8), אזור אישי/הרשמה (Phase 3) |
| **סטטוס קוד** | ✅ מומש ברובו (Phase 1-2) | Phase 3 (Auth) **כבר מומש ועובד בפועל** מסשן קודם — נשאר בקוד, לא הוסר. שאר ההרחבה (4/5/6/7/8) עדיין לא התחילה |
| **הערה** | זה מה שמתעדף עבודה מעכשיו (Phase 9 + שאריות Phase 2) | לא לפתח עוד מהרחבה זו עד אישור מפורש מהלקוח/משתמש |

> ⚠️ **הערה טכנית חשובה:** Phase 3 (Auth) כבר רץ בפרודקשן (קישור "התחברות/אזור אישי"
> מוצג ב-header לכל מבקר). אם הלקוח בוחר במסלול הבסיס בלבד, יש לשקול **להסיר את
> הקישור מה-header** (לא למחוק את הקוד) כדי שלא יוצג פיצ'ר שלא נמכר. שינוי זה
> ימתין להחלטה מפורשת — לא בוצע אוטומטית כחלק מעדכון הרודמאפ הזה.

## סיכום סטטוס נוכחי
- **שלב נוכחי:** Phase 2 — אתר תדמית (עיקרו מוכן: דף בית מלא, אודות, שירותים,
  גלריה, צור קשר עם טופס+server action, SEO בסיסי).
- **הבא בתור (מסלול בסיס):** Phase 2 שאריות (OG images/a11y — תלוי תמונות אמיתיות),
  ואז **Phase 9** (קישורי אפליקציה אמיתיים) כדי לסגור את מסלול הבסיס.
- **הרחבה (לא בעדיפות נוכחית):** Phase 4 (חנות) ואילך — **רק אם הלקוח יבחר בכך**.
- **פירוט משימות קטנות:** ראה [`docs/TASKS.md`](./docs/TASKS.md).
- **הקמת חשבונות ומפתחות (מה צריך ממך):** ראה [`docs/SETUP.md`](./docs/SETUP.md).
- **בדיקות:** typecheck + lint + test + build — ✅ ירוקים.

---

## Phase 0 — תכנון ותשתית 🔄
- [x] ✅ בחירת סטאק טכנולוגי (Next.js full-stack)
- [x] ✅ בחירת אירוח (Vercel + Supabase + Cloudflare R2)
- [x] ✅ יצירת 4 סקילים: planning, development, qa, security
- [x] ✅ יצירת קובץ מנחה CLAUDE.md
- [x] ✅ יצירת ROADMAP.md (קובץ זה)
- [x] ✅ מסמך ארכיטקטורה מפורט `docs/ARCHITECTURE.md`
- [ ] ⬜ commit + push ראשוני (לפי הוראת המשתמש)

## Phase 1 — Scaffolding ותשתית קוד 🔄
- [x] ✅ אתחול Next.js 15 + TypeScript strict + Tailwind v4 + תבנית shadcn
- [x] ✅ RTL + עברית + פונטים (Heebo/Assistant)
- [x] ✅ ESLint + Prettier + tsconfig strict
- [x] ✅ Prisma + `schema.prisma` (User) + `lib/env.ts` (zod) + `lib/db.ts`
- [x] ✅ Vitest + בדיקת sanity
- [x] ✅ Layout בסיסי (header/footer/ניווט) + design tokens + דף בית (Hero)
- [x] ✅ CI (GitHub Actions: typecheck/lint/test/build)
- [ ] ⏸️ חיבור Supabase (migration) + deploy ל-Vercel — ממתין למפתחות/חשבון
- [ ] ⬜ Playwright skeleton

## Phase 2 — אתר תדמית (Marketing) 🔄
- [x] ✅ דף בית (Hero, שירותים, CTA, אקדמיה, אודות תקציר, גלריה, המלצות, מיקום/קשר)
- [x] ✅ עמוד אודות
- [x] ✅ עמוד שירותים
- [x] ✅ גלריה (placeholder images עד לתמונות אמיתיות)
- [x] ✅ צור קשר + טופס (zod + honeypot אנטי-ספאם + server action, Resend אופציונלי)
- [x] ✅ SEO בסיסי: metadata לכל עמוד, sitemap.xml, robots.txt
- [ ] ⬜ OG images, נגישות מלאה (axe/Lighthouse) — ממתין לתמונות אמיתיות

## Phase 3 — אימות ואזור אישי (🔀 הרחבה אופציונלית — כבר מומש בקוד) 🔄
> תכנון מלא: [`docs/features/auth.md`](./docs/features/auth.md). **שיקול עדיפויות
> (2026-06-18):** הפיצ'ר הזה שייך להרחבה האופציונלית (לא למסלול הבסיס שנמכר ראשון).
> הקוד נשאר כמו שהוא — לא מבוטל ולא מוחק — אך אינו בעדיפות לעבודה נוספת כרגע.
- [x] ✅ תכנון (planning skill): מודל נתונים, חוזה API, UI, אבטחה, קריטריוני קבלה
- [x] ✅ התקנת `@supabase/supabase-js` + `@supabase/ssr`
- [x] ✅ `src/lib/supabase/{server,client,middleware}.ts`
- [x] ✅ `middleware.ts` (root) — חידוש session + הגנת `/account`
- [x] 🔄 SQL: trigger `handle_new_user` + RLS על `public.users` — קובץ מוכן
      (`prisma/migrations/20260617010000_auth_sync_and_rls/`), **לא הורץ עדיין** —
      TCP חסום ב-sandbox; להריץ ידנית ב-Supabase SQL Editor (כמו ה-migration הקודמת)
      ואז `npx prisma migrate resolve --applied 20260617010000_auth_sync_and_rls`.
- [x] ✅ `src/lib/auth-schema.ts` + `src/server/actions/auth.ts` (signUp/signIn/signOut/reset)
- [x] ✅ עמודים: `/login` `/register` `/forgot-password` `/reset-password` `/account`
- [x] ✅ `src/app/auth/callback/route.ts`
- [x] ✅ קישור התחברות/אזור אישי ב-`site-header.tsx`
- [x] ✅ סקיל security — נמצא ותוקן open-redirect דרך `?next=` (נוסף `safeRedirectPath`),
      נוסף honeypot אנטי-ספאם לטופס הרשמה
- [x] ✅ QA מול קריטריוני הקבלה — ראה Session Log למטה לפירוט מה אומת ומה ממתין ל-TCP/production

## Phase 4 — חנות (E-commerce) (🔀 הרחבה אופציונלית — ימתין לאישור לקוח) ⬜
- [ ] ⬜ מודל מוצרים/קטגוריות/מלאי (Prisma)
- [ ] ⬜ קטלוג + עמוד מוצר + חיפוש/סינון
- [ ] ⬜ עגלת קניות
- [ ] ⬜ צ'קאאוט (חישוב סכום בשרת באגורות, משלוח, קופונים)
- [ ] ⬜ אינטגרציית אחסון תמונות R2

## Phase 5 — תשתית תשלומים (🔀 הרחבה אופציונלית) ⬜
- [ ] ⬜ interface `PaymentProvider` + מתאם Mock
- [ ] ⬜ זרימת checkout → תשלום → callback מאומת (HMAC) → idempotency
- [ ] ⬜ תשתית מוכנה לחיבור Tranzila/HYP (ללא חיבור בפועל בשלב זה)

## Phase 6 — ניהול הזמנות (🔀 הרחבה אופציונלית) ⬜
- [ ] ⬜ מודל הזמנה + מחזור חיים (pending→paid→fulfilled→...)
- [ ] ⬜ היסטוריית הזמנות למשתמש
- [ ] ⬜ מיילי אישור (Resend)

## Phase 7 — אקדמיה (🔀 הרחבה אופציונלית) ⬜
- [ ] ⬜ מודל קורסים/שיעורים/הרשמות
- [ ] ⬜ קטלוג קורסים + עמוד קורס
- [ ] ⬜ הרשמה/רכישת קורס + גישת תוכן למשתמש רשום

## Phase 8 — ממשק ניהול (Admin) (🔀 הרחבה אופציונלית) ⬜
- [ ] ⬜ דשבורד אדמין + נתוני מפתח
- [ ] ⬜ ניהול מוצרים/מלאי
- [ ] ⬜ ניהול הזמנות (עדכון סטטוס, חיפוש)
- [ ] ⬜ ניהול קורסים/הרשמות
- [ ] ⬜ ניהול תוכן וגלריה (העלאה ל-R2)
- [ ] ⬜ ניהול משתמשים/הרשאות

## Phase 9 — חיבור לאפליקציית Restyle (קביעת תור) ✅
> אין ניהול תורים באתר — קיימת אפליקציית Restyle. ה-CTA "קביעת תור" מפנה אליה.
- [x] ✅ קונפיג קישורי האפליקציה (App Store / Google Play) ב-`siteConfig.booking`
- [x] ✅ כפתורי "קביעת תור" → אפליקציה לאורך האתר (Hero, ניווט, services, CTA, footer)
      דרך `BookingLink` (זיהוי פלטפורמה: Android→Google Play, אחרת→App Store)
- [x] ✅ סקציית "קביעת תור באפליקציה" בדף הבית

## Stage 1 — השלמת חלופה א' (אתר תדמית) 🔄
> תכנון מלא: [`docs/features/stage1-marketing-completion.md`](./docs/features/stage1-marketing-completion.md).
> Stage 1 = חלופה א' (`docs/QUOTE.md`). סגירת הפער בין הקוד לתכולה הנמכרת.
- [x] ✅ תכנון (planning skill) — מסמך פיצ'ר + קריטריוני קבלה
- [x] ✅ הרחבת `siteConfig` — פרטי קשר אמיתיים, `hours`, `accessibility`; `navLinks` בלי חנות + עם גלריה
- [x] ✅ ווידג'ט נגישות (`accessibility-menu`) + CSS + skip-to-content + `main#main`
- [x] ✅ עמוד הצהרת נגישות `/accessibility` (תאימות ת"י 5568/WCAG 2.0 AA, הסדרים, רכז נגישות, דיווח)
- [x] ✅ עמוד אקדמיה `/academy` (תוכן בלבד, ללא הרשמה) + `academy-data.ts`
- [x] ✅ עמוד מיקום ושעות `/locations` (כתובת/שעות/מפת Google)
- [x] ✅ הסתרת שאריות חלופה ב': קישור auth ב-header, חנות בניווט/hero, אזכורי "חנות" במטא-דאטה
- [x] ✅ security review (ווידג'ט נגישות + iframe) — אין ממצא Critical/High; נוסף `sandbox` ל-iframe
- [x] ✅ QA (Playwright): כל הנתיבים 200, אין חנות/התחברות, ווידג'ט נגישות עובד+נשמר אחרי רענון
- [x] ✅ typecheck/lint/test/build ירוקים

## Phase 10 — הקשחה והשקה ⬜
- [ ] ⬜ סקירת אבטחה מקיפה + security headers + rate limiting
- [ ] ⬜ מדיניות פרטיות/תנאי שימוש/עוגיות
- [ ] ⬜ ביצועים (Lighthouse), נגישות, בדיקות E2E מלאות
- [ ] ⬜ גיבויים, ניטור, לוגים
- [ ] ⬜ דומיין + production deploy

---

## Session Log
| תאריך | מה נעשה | הבא בתור |
|-------|---------|-----------|
| 2026-06-17 | Phase 0: בחירת סטאק ואירוח, יצירת 4 סקילים, CLAUDE.md, ROADMAP, מסמך ארכיטקטורה | commit/push ואז Phase 1 — Scaffolding |
| 2026-06-17 | פירוק מלא למשימות קטנות (docs/TASKS.md) + מדריך הקמת חשבונות ומפתחות (docs/SETUP.md) | הקמת חשבונות Vercel/Supabase/R2 ע"י המשתמש, ואז Phase 1 |
| 2026-06-17 | המותג = Restyle; הוסר ניהול תורים (הפניה לאפליקציית Restyle). Phase 1 Scaffolding: Next.js 15+TS+Tailwind v4, RTL+פונטים עבריים, header/footer/דף בית, Prisma+env+db, Vitest, CI. typecheck/lint/test/build ✅ | חיבור Supabase/Vercel (מפתחות מהמשתמש), Playwright, ואז Phase 2 |
| 2026-06-17 | הוזנו מפתחות Supabase ל-`.env.local` (לא ב-git). Sandbox חסם TCP ל-Postgres (רק HTTPS) — נוצרה migration ראשונה (`prisma migrate diff --from-empty`, ללא חיבור חי) והורצה ידנית ב-Supabase SQL Editor. המשתמש עדכן Network Access ל-"Full" ב-Environment Settings — ייכנס לתוקף רק בסשן חדש. נכתבה תיבת "🚦 להתחיל מכאן" ב-ROADMAP עם הוראות מדויקות להמשך. | פתיחת סשן חדש → לפי הצ'קליסט בתיבה למעלה: לאשר migrate status, `migrate resolve --applied` אם צריך, ואז Phase 2 |
| 2026-06-17 | container חדש (אותו DB Supabase) — המשתמש הזין מחדש מפתחות ל-`.env.local`. גם עם "Full" Network Access, TCP ל-Postgres עדיין חסום (רק HTTPS) — לא חוסם יותר, ממשיכים בלעדיו. **Phase 2 הושלם ברובו**: דף בית מלא (שירותים, CTA, אקדמיה, אודות, גלריה, המלצות, מיקום/קשר), עמודי about/services/gallery/contact, טופס צור קשר (react-hook-form+zod+honeypot) עם server action ו-Resend אופציונלי (fallback ללוג), sitemap.ts+robots.ts. הותקנו `react-hook-form`, `@hookform/resolvers`, `resend`. typecheck/lint/test/build ✅, build+start נבדק ב-curl (200 לכל העמודים). | Phase 2 שאריות (OG images, Lighthouse/a11y — תלוי תמונות אמיתיות), ואז Phase 3 — Supabase Auth |
| 2026-06-17 | נוסף אפקט הגלילה המייחד את menspire.com (נבדק בפועל עם Playwright — רקע `position:fixed` שנשאר צמוד למסך עד שהסקציה הבאה מכסה אותו, לא parallax הדרגתי כמו שחשבתי בהתחלה). מומש כ-CSS טהור (`fixed inset-0 -z-10` ב-Hero) ללא JS. נוסף קומפוננטת `Reveal` (IntersectionObserver, fade/slide-on-scroll, מכבד `prefers-reduced-motion`) ועליה עברו כל הסקציות בדף הבית. typecheck/lint/test/build ✅, אומת ויזואלית עם Playwright מול שרת build מקומי (screenshots בכמה עומקי גלילה). | Push לעדכון PR #1, ואז Phase 2 שאריות / Phase 3 — Supabase Auth |
| 2026-06-17 | המשתמש דיווח שלא ראה את האפקט בפריוויו — אותר ותוקן באג: גובה ה-Hero היה מדויק ל-viewport אחד כך שלא היה מרחק גלילה בו ה-pinning ניכר; שונה ל-`min-h-[170vh]`. נוסף רקע תמונה אמיתית (`public/images/hero-bg.jpg`, תמונת המשתמש) במקום placeholder. התגלה ותוקן **באג קריטי ב-Tailwind v4**: שילוב syntax של ערך שרירותי בסוגריים על טוקן `@theme` רשום + modifier שקיפות (למשל `bg-[--color-ink]/55`) מקמפל ל-CSS לא תקין (`color-mix` בלי `var()`) שהדפדפן מתעלם ממנו בשקט — תוקן בכל הקובץ ע"י מעבר לשם הטוקן הרשום בלי סוגריים (`bg-ink/55` וכו') ב-`page.tsx`, `button.tsx`, `site-header.tsx`. typecheck/lint/test/build ✅, אומת ויזואלית עם Playwright — הטקסט קריא על הרקע הכהה וה-pinning ניכר בבירור. | Push, לבדוק עם המשתמש מול ה-preview, ואז Phase 2 שאריות / Phase 3 |
| 2026-06-17 | המשתמש שלח הקלטת מסך של menspire.com וביקש לסגנן את דף הבית בהשראתו (הוחלט בתיאום: דף הבית בלבד, לא סקציות תוכן חדשות). דף הבית עוצב מחדש: כותרות ממורכזות, באנרי תמונה מלאי-רוחב לסקציות אקדמיה/אודות, פינות חדות (rounded-none) בכרטיסי שירותים/גלריה/באנרים, כפתורי outline עם uppercase+tracking, כרטיסי שירותים/המלצות בגריד עם border דק. **בתהליך נתגלה באג Tailwind v4 חריף יותר ממה שזוהה קודם**: `bg-[--color-x]` (גם בלי modifier שקיפות!) מקמפל ל-`background-color:--color-x` לא תקין (חסר `var()`) — גרם לכל הסקציות עם רקע אטום לאבד את הרקע בשקט, וה-Hero ה-fixed "מדמם" דרכן בכל הדף. **תוקן גלובלית**: כל מופע `[--color-x]` בקוד הומר לשם הטוקן הרשום (`x`) ב-8 קבצים (`page.tsx`, `section-heading.tsx`, `site-header.tsx`, `button.tsx`, `contact-form.tsx`, `services/page.tsx`, `image-placeholder.tsx`, `site-footer.tsx`). typecheck/lint/test/build ✅, אומת ויזואלית עם Playwright בכמה עומקי גלילה — כל הרקעים אטומים כצפוי, אין דימום, העיצוב החדש תקין. | Push, לבדוק עם המשתמש מול ה-preview |
| 2026-06-17 | המשתמש ביקש "כפתורים עם מראה מודרני" — עודכן `buttonVariants` ב-`button.tsx` (קומפוננטה משותפת לכל האתר): hover lift עדין (`-translate-y-0.5`) + shadow מוגבר, מעבר חלק (`transition-all duration-200`), ו-`active:scale-[0.97]` למשוב לחיצה טקטילי. typecheck/lint/test/build ✅, אומת ויזואלית עם Playwright (צילום מסך לפני/אחרי hover). הסשן מסתיים כאן לפי בקשת המשתמש — תיעוד מלא למעבר לסשן חדש. | לפתוח סשן חדש → לפי הצ'קליסט "🚦 להתחיל מכאן" למעלה (עדיין רלוונטי, אין שינוי במצב ה-DB/env). להמשיך Phase 2 שאריות (OG images, a11y/Lighthouse — תלוי תמונות אמיתיות) ואז Phase 3 — Supabase Auth. PR #1 פתוח (draft) ומחובר ל-Vercel preview; כל ה-pushes האחרונים deployed בהצלחה. |
| 2026-06-17 | **Phase 3 — Supabase Auth מומש במלואו (קוד)**, לפי תהליך מלא planning→development→security→qa: תכנון מתועד ב-`docs/features/auth.md`. הותקנו `@supabase/supabase-js`+`@supabase/ssr`. נוצרו `src/lib/supabase/{server,client,middleware}.ts`, `middleware.ts` (root, מגן על `/account/**`), `src/lib/auth-schema.ts` (zod), `src/server/actions/auth.ts` (signUp/signIn/signOut/requestPasswordReset/updatePassword — כולם בודקים session אמיתי בשרת, לעולם לא סומכים על קלט קליינט), עמודי `/login` `/register` `/forgot-password` `/reset-password` `/account` (RTL, עברית, תבנית react-hook-form+zod זהה לטופס צור קשר), `src/app/auth/callback/route.ts`, וקישור התחברות/אזור אישי ב-`site-header.tsx`. נכתב SQL migration (`prisma/migrations/20260617010000_auth_sync_and_rls/`) עם trigger `handle_new_user` (מסנכרן auth.users→public.users) ו-RLS על `public.users` — **טרם הורץ** (TCP חסום, כמו בכל הסשנים). **סקירת security מצאה ותיקנה**: open-redirect דרך פרמטר `?next=` (נוסף `safeRedirectPath` ב-`lib/utils.ts`, מופעל ב-login-form וב-callback route) + נוסף honeypot אנטי-ספאם לטופס הרשמה. **QA**: typecheck/lint/test/build ✅; אומת מול ה-API האמיתי של Supabase (HTTPS עובד גם כש-TCP חסום) — signUp/signIn/forgot-password נבדקו בפועל מול הפרויקט (כולל פגיעה אמיתית ב-rate-limit של Supabase, שמוכיחה אינטגרציה אמיתית); `/account` ללא session מפנה 307 ל-`/login?next=/account` (אומת ב-curl); RTL+מובייל/דסקטופ אומתו ויזואלית ב-Playwright בכל 4 העמודים החדשים. **לא אומת** (תלוי TCP/production): כתיבה בפועל לטבלת `public.users` דרך ה-trigger, ומסע משתמש מלא הרשמה→אימות מייל→התחברות→logout מקצה-לקצה (כי signUp האחרון נחסם ב-rate-limit). | להריץ את ה-SQL migration ב-Supabase SQL Editor (קריטי — בלעדיו `public.users` לא יתעדכן בהרשמה אמיתית), ואז `prisma migrate resolve --applied`. להמשיך Phase 2 שאריות (OG images/Lighthouse — תלוי תמונות), ולשקול Phase 4 (חנות) כהמשך טבעי. ממתין להחלטת המשתמש לגבי commit/push. |
| 2026-06-17/18 | Phase 3 הועלה ל-production (Vercel): commit+push, אותרו ותוקנו שני באגי CI/Deploy לא קשורים לקוד עצמו — (1) `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` היו רק ב-`.env.local` המקומי ולא ב-GitHub Actions secrets/Vercel Env Vars → build נכשל; המשתמש הוסיף אותם בשני המקומות, ו-`ci.yml` עודכן להזריק אותם לשלב ה-build. (2) Vercel Hobby חסם deploy כי ה-commit הגיע מ"מחבר" (Claude bot identity) בלי הרשאת collaborator על ריפו פרטי — נפתר ע"י הפיכת הריפו לציבורי (אומת קודם שאין סודות בהיסטוריית git). שני ה-redeploy-ים הבאים הצליחו (Ready). נוצרה גם `docs/QUOTE.md` — הצעת מחיר ללקוח בשתי חלופות (דף תדמית פרימיום ₪4,500-8,500 / מערכת מלאה ₪35,000-65,000 + עלויות שוטפות), והופק כ-PDF (לא נשמר ב-git, נשלח למשתמש). | בקשת המשתמש (ראה רשומה הבאה): שינוי סדר עדיפויות ב-ROADMAP. |
| 2026-06-18 | **שינוי סדר עדיפויות (לא שינוי קוד)**: לפי בקשת המשתמש, המוצר שנמסר ראשון הוא **אתר תדמית בלי חנות ובלי הרשמת משתמשים**; חנות+תשלומים+הזמנות+אקדמיה+אדמין+auth (Phases 3-8) עברו לסטטוס "🔀 הרחבה אופציונלית" שתופעל רק אם הלקוח יבחר בה (תואם את שתי החלופות ב-`docs/QUOTE.md`). **הקוד הקיים של Phase 3 (Auth) לא הוסר ולא בוטל** — נשאר פעיל בפרודקשן כמו שהוא; רק עדיפות העבודה הבאה השתנתה. נוספה תיבת "🔀 שני מסלולים" בראש הרודמאפ, ועודכנה תיבת "🚦 להתחיל מכאן". | המשך **Phase 2 שאריות** (OG images, a11y/Lighthouse — תלוי תמונות אמיתיות) ואז **Phase 9** (קישורי אפליקציה אמיתיים) כדי לסגור את מסלול הבסיס. Phase 3-8 ימתינו לאישור מפורש שהלקוח בחר בהרחבה. לשקול (לא בוצע) הסרת קישור "התחברות/אזור אישי" מה-header אם מסלול הבסיס הוא הסופי. |
| 2026-06-18 | עודכנה הצעת המחיר (`docs/QUOTE.md`): מחירים ₪5,000 (חלופה א') / +₪10,000 (חלופה ב', סה"כ ₪15,000), עלות API מיילים מעל 30/יום, Vercel Pro לריפו פרטי, כפתורי נגישות לפי חוק, גישה לקוד בגיטהאב בסיום. יעד מיילי צור קשר שונה ל-`Restyle.Barbershop@outlook.com`. **עוגן נוהל ב-CLAUDE.md**: תמיד planning → עדכון ROADMAP → build. | תחילת Stage 1. |
| 2026-06-18 | **Stage 1 = חלופה א' — הושלם** (planning→ROADMAP→development→security→QA). תכנון: `docs/features/stage1-marketing-completion.md`. נבנו: (1) **ווידג'ט נגישות** (`accessibility-menu.tsx`, client+localStorage) עם הגדלת/הקטנת טקסט, ניגודיות גבוהה, גווני אפור, הדגשת קישורים, פונט קריא, עצירת אנימציות, סמן גדול, איפוס; CSS ב-`globals.css`; `skip-to-content` + `main#main` + focus-visible. (2) **עמוד הצהרת נגישות** `/accessibility` (ת"י 5568/WCAG 2.0 AA + רכז נגישות). (3) **עמוד אקדמיה** `/academy` (תוכן בלבד) + `academy-data.ts`. (4) **עמוד מיקום ושעות** `/locations` (כתובת/שעות/מפת Google iframe עם sandbox). (5) **הסתרת שאריות חלופה ב'**: הוסר קישור auth + קריאת supabase מה-header (header סטטי), הוסר "חנות" מ-navLinks/hero/מטא-דאטה, נוסף "גלריה" לניווט. הורחב `siteConfig` (contact אמיתי, hours, accessibility). security: אין Critical/High. QA Playwright: כל הנתיבים 200, ווידג'ט עובד+נשמר אחרי רענון. typecheck/lint/test/build ✅. | תמונות אמיתיות (Hero/גלריה/אקדמיה) + Lighthouse; שם רכז נגישות ייעודי; דומיין+production. ממתין להחלטת המשתמש לגבי commit/push ומיזוג. |
