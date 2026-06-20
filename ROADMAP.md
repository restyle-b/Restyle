# ROADMAP — Restyle 🪒

> **קובץ מנחה ומקור האמת להתקדמות הפרויקט.**
> מתעד מה כבר עשינו ✅, מה בעבודה 🔄, ומה נשאר ⬜.
> **לעדכן לפני סיום כל סשן** (לפי הוראת המשתמש) + להוסיף רשומה ל-Session Log בתחתית.

מקרא: ✅ הושלם ונבדק (QA) · 🔄 בעבודה · ⬜ לא התחיל · ⏸️ ממתין/חסום

---

## 🚦 להתחיל מכאן בסשן הבא — קריטי!

**מצב (עודכן 2026-06-18):** מסלול הבסיס (אתר תדמית, ללא חנות/הרשמה) **מושלם פונקציונלית**:
i18n (he/en/ar), ווידג'ט נגישות, תפריט מובייל מסך-מלא, טיפוגרפיה ופלטת צבעים סופית
(אפור בהיר שטוח, ללא מרקם), לחצני יצירת קשר צפים, 4 סבבי pentest (HIGH→LOW תוקנו),
security headers, rate limiting. typecheck/lint/test/build ירוקים בכל commit. נדחף ל-PR #3
(draft, Vercel preview ירוק). Phase 3-8 (auth/חנות/תשלומים/אקדמיה/אדמין) **כבר מומשו בקוד
ורצים בפרודקשן**, אבל שייכים ל"הרחבה אופציונלית" (חלופה ב') — **אל תמשיך לפתח אותם בלי
אישור מפורש מהמשתמש שהלקוח בחר בהרחבה**.

### משימות פתוחות שדורשות פעולת המשתמש (לא חוסמות פיתוח קוד):
1. **להריץ ידנית ב-Supabase SQL Editor**: `prisma/migrations/20260618120000_prevent_role_escalation`
   (trigger שמונע הסלמת הרשאות עצמית בטבלת `users`) — קריטי לפני שחרור admin/auth לפרודקשן.
2. להחליט אם לשדרג rate-limiting מ-in-memory ל-Vercel KV/Upstash לפני תנועה אמיתית.
3. תמונות אמיתיות (Hero/גלריה/אקדמיה/אודות) — כרגע placeholders.
4. שם רכז נגישות אמיתי בעמוד `/accessibility` (כרגע placeholder).
5. Lighthouse audit + בדיקת קונטרסט WCAG AA מלאה על כל שימושי ה-accent.
6. החלטה על מיזוג PR #3 ל-main, ועל הגירת Next.js מ-15.5.x ל-16.x בעתיד.
7. דובר שפת-אם לבדוק את תרגומי en/ar (נעשו ע"י Claude).

### צ'קליסט פתיחה לסשן הבא:
1. `git status` ו-`git log -1` — לאשר שה-branch (`claude/continue-previous-session-fqebtt`) מסונכרן.
2. `npm run typecheck && npm run lint && npm test && npm run build` — לאשר שהכל ירוק לפני שינוי נוסף.
3. לקרוא את ה-Session Log האחרון בתחתית הקובץ למצב המדויק שהושאר.
4. אין כרגע אבני-דרך חסומות מבחינת DB/env — `.env.local` (לא ב-git) קיים ב-container; אם container חדש מאפס, יש לבקש מהמשתמש להזין מחדש לפי `docs/SETUP.md`.

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

## Stage 1.1 — לחצני יצירת קשר מהירה (וואטסאפ / טלפון / וייז) 🔄
> תכנון: לחצנים צפים (וואטסאפ+טלפון) בכל האתר; שורת לחצנים מלאה (וייז+טלפון+וואטסאפ)
> בעמודי מיקום וצור קשר. מקור אמת: `src/lib/contact-links.ts`.
- [ ] 🔄 תיקון geocoding של הכתובת (הסיכה נחתה בהרצליה במקום ת"א) — ממתין לקישור Maps/Plus לקואורדינטות מדויקות
- [x] ✅ `contact-links.ts` (tel / wa.me / waze / mapEmbed) + `siteConfig.contact.whatsapp`
- [x] ✅ קומפוננטת `ContactActions` (שורת לחצנים) + `FloatingContact` (צפים) — RSC, target/rel בטוחים
- [x] ✅ שילוב: צפים ב-layout (ימין-תחתון); שורה בעמוד מיקום ובעמוד צור קשר
- [x] ✅ security (קישורים חיצוניים `noopener noreferrer`) + QA (Playwright) + typecheck/lint/test/build

## Stage 1.2 — דפי חובה לקראת השקה 🔄
> תכנון: עמודי מדיניות פרטיות/תקנון (חוק הגנת הפרטיות — טופס צור קשר אוסף PII) + favicon.
- [x] ✅ עמוד מדיניות פרטיות `/privacy` (מה נאסף, מטרה, מעבדים, עוגיות, זכויות לפי חוק הגנת הפרטיות)
- [x] ✅ עמוד תקנון/תנאי שימוש `/terms`
- [x] ✅ favicon מותג (`src/app/icon.svg`)
- [x] ✅ קישורים ב-footer (פרטיות/תקנון ליד הצהרת נגישות)
- [x] ✅ typecheck/lint/test/build + QA (כל הנתיבים 200, favicon נטען, קישורי footer קיימים)
> נדחה: אימות שליחת מייל בפרודקשן (Resend), Lighthouse, OG image (תלוי תמונות), תמונות אמיתיות.

## Stage 2 — רב-לשוניות (i18n: עברית/אנגלית/ערבית) 🔄
> תכנון מלא: [`docs/features/i18n.md`](./docs/features/i18n.md). `next-intl`, עברית
> ברירת מחדל בלי prefix, אנגלית/ערבית עם `/en` `/ar`. RTL לעברית/ערבית, LTR לאנגלית.
- [x] ✅ תכנון (planning) — מסמך פיצ'ר + קריטריוני קבלה
- [x] ✅ התקנת `next-intl` + מבנה `i18n/` + שילוב middleware (`src/middleware.ts`)
- [x] ✅ העברת `src/app/*` ל-`src/app/[locale]/*`
- [x] ✅ `messages/he.json` (חילוץ) → תרגום `en.json`/`ar.json`
- [x] ✅ חיווט כל העמודים/קומפוננטות ל-`useTranslations` (כולל ווידג'ט הנגישות, sitemap עם hreflang)
- [x] ✅ `LocaleSwitcher` ב-header/footer
- [x] ✅ תיקון RTL/LTR ללחצנים צפים ומיקומים מוחלטים (`start-4`/`end-4`)
- [ ] 🔄 QA (Playwright 3 שפות — בדיקה ויזואלית RTL/LTR מלאה) + typecheck/lint/test/build
> הערה: תרגום אנגלית/ערבית נעשה ע"י Claude — מומלץ בדיקת דובר שפת-אם לפני השקה.
> עמודי auth (`/login` `/register` `/forgot-password` `/reset-password` `/account`) נשארו בעברית בלבד במכוון — שייכים ל"חלופה ב'" שלא נמכרה.

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
| 2026-06-18 | **Stage 1 = חלופה א' — הושלם** (planning→ROADMAP→development→security→QA). תכנון: `docs/features/stage1-marketing-completion.md`. נבנו: (1) **ווידג'ט נגישות** (`accessibility-menu.tsx`, client+localStorage) עם הגדלת/הקטנת טקסט, ניגודיות גבוהה, גווני אפור, הדגשת קישורים, פונט קריא, עצירת אנימציות, סמן גדול, איפוס; CSS ב-`globals.css`; `skip-to-content` + `main#main` + focus-visible. (2) **עמוד הצהרת נגישות** `/accessibility` (ת"י 5568/WCAG 2.0 AA + רכז נגישות). (3) **עמוד אקדמיה** `/academy` (תוכן בלבד) + `academy-data.ts`. (4) **עמוד מיקום ושעות** `/locations` (כתובת/שעות/מפת Google iframe עם sandbox). (5) **הסתרת שאריות חלופה ב'**: הוסר קישור auth + קריאת supabase מה-header (header סטטי), הוסר "חנות" מ-navLinks/hero/מטא-דאטה, נוסף "גלריה" לניווט. הורחב `siteConfig` (contact אמיתי, hours, accessibility). security: אין Critical/High. QA Playwright: כל הנתיבים 200, ווידג'ט עובד+נשמר אחרי רענון. typecheck/lint/test/build ✅. נדחף; נוצר draft PR #3; Vercel Preview ירוק. | תמונות אמיתיות (Hero/גלריה/אקדמיה) + Lighthouse; שם רכז נגישות ייעודי; דומיין+production. ממתין להחלטת המשתמש לגבי מיזוג. |
| 2026-06-18 | **Stage 1.1 — לחצני יצירת קשר מהירה** (planning→ROADMAP→build). נוצרו `contact-links.ts` (מקור אמת: tel/wa.me/waze/mapEmbed) + `siteConfig.contact.whatsapp`; קומפוננטות `ContactActions` (שורת וייז/טלפון/וואטסאפ) ו-`FloatingContact` (וואטסאפ+טלפון צפים ימין-תחתון). שולבו: צפים בכל האתר (layout), שורה מלאה בעמודי מיקום+צור קשר. קישורים חיצוניים עם `target=_blank rel=noopener noreferrer`. typecheck/lint/test/build ✅, QA Playwright ✅. **פתוח**: ה-geocoding של הכתובת ממקם בהרצליה במקום ת"א — ממתין לקישור Google Maps/Plus מהמשתמש לקואורדינטות מדויקות (למפה ולוייז). | קבלת קישור מיקום מדויק; מיזוג PR #3. |
| 2026-06-18 | **לוגו/Wordmark**: המשתמש רצה התאמה מדויקת ללוגו "ReStyle" שלו. גופני web (Playfair/DM Serif וכו') לא היו מדויקים מספיק. מאחר שאין למשתמש קובץ מקור, **נוקתה תמונת ה-JPEG שלו** עם `sharp` (בהירות→alpha, הסרת רקע שחור, חיתוך, x2) → `public/restyle-logo.png` (לבן שקוף). `Wordmark` עודכן לרנדר את התמונה (`next/image`, `priority`, alt) במקום טקסט; שולב בהדר (h-8) ובפוטר (h-9). הוסר גופן Playfair ו-`.font-logo`. `siteConfig.name` נשאר "Restyle" לטקסט/SEO. typecheck/lint/build ✅, אומת ויזואלית. | האיכות מוגבלת ע"י המקור (קטן/רך) — אם יושג SVG/PNG ברזולוציה גבוהה, להחליף. |
| 2026-06-18 | **Stage 1.2 — דפי חובה לקראת השקה** (planning→ROADMAP→build). נוצרו: עמוד **מדיניות פרטיות** `/privacy` (מה נאסף בטופס צור קשר, מטרה, מעבדים Vercel/Resend, הגדרות נגישות ב-localStorage בלבד, אין עוגיות מעקב, זכויות לפי חוק הגנת הפרטיות תשמ"א-1981), עמוד **תקנון** `/terms`, **favicon** מותג (`src/app/icon.svg` — מונוגרמת R זהב), וקישורי footer (פרטיות/תקנון ליד הצהרת נגישות). typecheck/lint/test/build ✅, QA ✅. | **נשאר לחלופה א'**: תמונות אמיתיות (גלריה/אקדמיה/אודות), תיקון סיכת מפה (קישור מהמשתמש), שם רכז נגישות אמיתי, אימות שליחת מייל בפרודקשן, Lighthouse, דומיין+production, מיזוג PR #3. |
| 2026-06-18 | **סיבוב QA כולל** על כל עמודי האתר (mobile 390px + desktop, Playwright, כל ה-routes 200, typecheck/lint/test/build) בעקבות "תמשיך להתקדם". נמצאו ותוקנו 2 באגים אמיתיים: (1) **"RESTYLE" מוצג ב-UPPERCASE** בתוויות ה-eyebrow בדף הבית ובעמוד האקדמיה — `SectionHeading` מפעיל `text-transform:uppercase` על כל eyebrow string, מה שעיקם את שם המותג "ReStyle"→"RESTYLE" ויזואלית; נפתר בניסוח מחדש ("האקדמיה שלנו" במקום "אקדמיית ReStyle"), בלי לשנות את הקומפוננטה המשותפת. (2) **הלחצנים הצפים (וואטסאפ/טלפון) חוסמים קישורי footer** בתחתית הדף במובייל (קישור "להורדת האפליקציה" וקישורי פרטיות/תקנון/נגישות) — נוסף `pb-28 sm:pb-6` לשורת ה-footer התחתונה כדי לפנות מקום מתחת ללחצנים הצפים. אומת: ה"באג" שנראה כפער ענק בצילום fullPage התברר כארטיפקט תפירה של Playwright (רקע ה-Hero `fixed` משוכפל בצילומי fullPage) — לא באג אמיתי, אומת מול גלילה אמיתית. typecheck/lint/test/build ✅. | המשך מעקב אחר UI/copy issues; שאר הפריטים הפתוחים ללא שינוי (תמונות, מפה, רכז נגישות, Resend prod, Lighthouse, מיזוג PR #3). |
| 2026-06-18 | **Stage 2 — i18n (עברית/אנגלית/ערבית) מומש במלואו (קוד)**, לפי planning→development→QA חלקי. תכנון מתועד ב-`docs/features/i18n.md`. הותקן `next-intl`; נוסף `src/i18n/` (`routing.ts` עם `locales: [he,en,ar]`, `defaultLocale: he`, `localePrefix: as-needed`; `navigation.ts` עם `Link`/`useRouter`/`usePathname`/`getPathname` locale-aware; `request.ts`). כל `src/app/*` הועבר ל-`src/app/[locale]/*` (כולל עמודי auth, שנשארו תוכן עברית-בלבד במכוון — שייכים ל"חלופה ב'" שלא נמכרה). נוצרו `messages/he.json` (חילוץ כל הטקסטים הקשיחים) + תרגום מלא ל-`en.json`/`ar.json`. כל העמודים והקומפוננטות המשותפות (`site-header`, `site-footer`, `floating-contact`, `accessibility-menu`, `contact-form`, `skip-to-content` ועוד) חוּוְּטו ל-`useTranslations`/`getTranslations`; קבצי דאטה (`services-data.ts`, `academy-data.ts`) צומצמו לסלאגים בלבד (תוכן עבר ל-messages); `testimonials-data.ts` הוסר. נוסף `LocaleSwitcher` (`src/components/locale-switcher.tsx`) ב-header. תוקנו מיקומי RTL/LTR ללחצנים צפים/ווידג'ט נגישות (`start-4`/`end-4` לוגי במקום `left`/`right`). `sitemap.ts` נכתב מחדש לפלט per-locale עם `hreflang alternates`. **התגלה ותוקן באג קריטי**: `middleware.ts` היה ב-project root במקום `src/middleware.ts` (הפרויקט משתמש בקונבנציית `src/`) — Next.js התעלם ממנו בשקט (לא נרשם, `middleware-manifest.json` הראה ריק), מה שגרם ל-404 בשורש הלא-מתויג ותוכן שגוי בנתיבים מתויגים; אותר רק בבדיקת runtime עם `npm run start`+`curl` (typecheck/lint/test/build כולם עברו ירוק בלי לחשוף את הבאג!). תוקן ע"י `git mv middleware.ts src/middleware.ts`. תוקן גם באג משני: ה-callback `setAll` של Supabase cookies מחק את ה-rewrite headers/cookies של `intlMiddleware`. **QA**: typecheck/lint/test/build ✅; אומת ב-curl על כל 3 השפות (`/`, `/en`, `/ar` + תתי-נתיבים) — `lang`/`dir` נכונים, תוכן מתורגם נכון, ניווט/LocaleSwitcher תקינים. **לא בוצע עדיין**: QA ויזואלי מלא עם Playwright (RTL/LTR layout, חפיפות, קליק בפועל על LocaleSwitcher — לא היה כלי דפדפן זמין בסביבה זו). נדחף וקיים PR #3 (draft, Vercel preview ירוק). בעקבות שאלת המשתמש "לחצן לשינוי שפה?" התגלה **באג נגישות נוסף**: ה-header לא הכיל בכלל תפריט מובייל (hamburger) — קישורי ניווט היו `hidden md:flex` ו-`LocaleSwitcher` היה `hidden sm:inline-flex`, כך שבמובייל לא הייתה שום דרך לראות ניווט או להחליף שפה. **תוקן**: נוסף `src/components/mobile-nav.tsx` (כפתור hamburger + פאנל נפתח עם קישורי ניווט/LocaleSwitcher/CTA קביעת תור, בסטייל הכהה/זהב הקיים), שולב ב-`site-header.tsx`. נוספו מפתחות `nav.openAria`/`nav.closeAria` לשלוש השפות. typecheck/lint/test/build ✅, אומת ב-curl (he/en aria-labels נכונים). נדחף. | QA ויזואלי עם Playwright בשלוש השפות (כולל קליק בפועל על תפריט המובייל); מיזוג PR #3 לפי שיקול המשתמש. |
| 2026-06-18 | **טיפוגרפיה — מעבר למינימליסטי-נקי** (בקשת המשתמש, השראת orhayoon.com): הוסרו גופני הסריף (Frank Ruhl Libre / El Messiri); כעת Assistant (he/en) ו-Cairo (ar) משמשים גם לכותרות וגם לטקסט רץ, היררכיה לפי משקל/גודל. הלוגו (תמונה) ללא שינוי. לפני כן תוקן באג: Heebo/Assistant לא תומכים בערבית → `/ar` נפל לגופן מערכת; נוסף Cairo. typecheck/lint/test/build ✅. | המשך דיוק ויזואלי (משקלים/ריווח) לפי משוב; QA. |
| 2026-06-18 | **Pentest + תיקון 6 ממצאים** (סקיל security, מהחמור לקל). **HIGH:** הסלמת הרשאות — policy RLS איפשר עדכון `role` עצמי; נוסף trigger `prevent_role_change` (migration `20260618120000`, דורש הרצה ידנית ב-Supabase). **MED:** (1) Security headers ב-`next.config.ts` (CSP/HSTS/X-Frame-Options/X-Content-Type/Referrer/Permissions); (2) rate limiting (`lib/rate-limit.ts`, in-memory best-effort) על contact/signin/signup/reset; (3) הוסר לוג PII מטופס צור-קשר בפרודקשן; (4) Host-header poisoning — `getOrigin` מאמת host מול allowlist. **LOW:** עקיפת backslash ב-`safeRedirectPath` (+בדיקה). אומת: headers בפועל ב-curl, כל הנתיבים 200 תחת CSP, typecheck/lint/test (7) /build ✅. תועד ב-`docs/ARCHITECTURE.md §7.1`. נדחף. | להריץ migration `20260618120000` ב-Supabase לפני שחרור אדמין; לשדרג rate-limit ל-Vercel KV לפרודקשן; QA ויזואלי; מיזוג PR #3. |
| 2026-06-18 | **Pentest סבב שני** (בקשת "תנסה לתקוף שנית") — כולל ניסיון לשבור את התיקונים מהסבב הראשון. נמצאו ותוקנו: **MED (רגרסיה בתיקון שלי):** `getClientIp` סמך על ה-entry השמאלי של `x-forwarded-for` שנשלט ע"י הלקוח → עקיפת rate-limit מלאה + ניפוח Map; תוקן לעדיפות `x-real-ip`. **LOW:** הודעת signUp רמזה על קיום אימייל (enumeration) → גנרית; honeypot `company` ללא max → הוגבל 256; נוסף COOP. **BUG/SEO:** `robots.txt`+`sitemap.xml` החזירו 404 (ה-matcher של ה-middleware תפס אותם, next-intl פירש כ-locale) → תוקן ה-matcher, גם הוקשח robots עם disallow לעמודי auth. אומת: robots/sitemap=200, `/account`=307 (הגנה תקינה), typecheck/lint/test(7)/build ✅. תועד `docs/ARCHITECTURE.md §7.2`. נדחף. | להריץ migration `20260618120000` ב-Supabase; Vercel KV ל-rate-limit; QA ויזואלי; מיזוג PR #3. |
| 2026-06-18 | **Pentest סבב שלישי (מעמיק)** — supply-chain, דליפת סודות, SSRF, ושבירת תיקונים קודמים. נמצאו ותוקנו: **MED — DoS amplification:** ה-middleware קרא `supabase.auth.getUser()` על כל בקשה (גם אנונימית בעמוד ציבורי) → הצפת האתר מגבירה להצפת Supabase Auth; תוקן לפנות ל-Supabase רק בנתיב מוגן או כשיש cookie `sb-*`. **MED (פגם בתיקון שלי מסבב 1):** `getOrigin` עם `host.startsWith("localhost")` אישר `localhost.evil.com` → תוקן להתאמה מדויקת. **תלויות:** `npm audit` הראה HIGH(vite)+moderate(postcss) — dev/build-time בלבד, לא חשוף בפרודקשן; ⚠️ לא להריץ `audit fix --force` (מוריד Next ל-v9). **נבדק ונקי:** אין סודות-שרת ב-client bundle; אין SSRF דרך `/_next/image` (חיצוני+metadata=400); אין stored XSS (React escaping). אומת: `/`=200 (מדלג Supabase), `/account`+`/en/account`=307, robots/sitemap=200, typecheck/lint/test(7)/build ✅. תועד `docs/ARCHITECTURE.md §7.3`. נדחף. | להריץ migration `20260618120000` ב-Supabase; Vercel KV ל-rate-limit; עדכון תלויות (Next/vitest) בעתיד; QA ויזואלי; מיזוג PR #3. |
| 2026-06-18 | **Pentest סבב 4 — מבוסס מחקר CVE עדכני** (בקשת "תבדוק באינטרנט ותריץ עד סבב נקי"). מחקר באתרי Next.js/Vercel רשמיים: אומת ש-**Next 15.5.19 מוגן מול כל ה-CVEs הידועים** — CVE-2025-29927 (middleware bypass, fix 15.2.3, **נבדק בפועל**: header bypass ל-`/account` עדיין 307), CVE-2025-66478 React2Shell RCE (fix 15.5.7), Source-Code-Exposure+DoS (fix 15.5.9), ו-Next May-2026 release (13 advisories כולל CVE-2026-23870, fix 15.5.18). תוקן **X-Powered-By** (LOW fingerprinting) → `poweredByHeader:false`. נבדק ונקי: אין source maps (404), path traversal→404, long-path→404, TRACE→500 גנרי בלי stack ללקוח, methods לא צפויים על `/account`→307. ⚠️ קו 15.5 הוא תחזוקה — לתכנן הגירה ל-16.x. typecheck/lint/test(7)/build ✅. תועד `docs/ARCHITECTURE.md §7.4`. נדחף. | סבב אישור נקי; הרצת migration ב-Supabase; הגירת Next 16 + Vercel KV בעתיד; מיזוג PR #3. |
| 2026-06-18 | **QA ויזואלי מלא עם Playwright** (בעקבות "הכל" — השלמת הפריט הפתוח מ-Stage 2). הותקן דפדפן Chromium (`npx playwright install`), הורץ `next build`+`next start` ונבדק חזותית: עמוד הבית desktop+mobile (עברית), `/ar` ו-`/en` desktop, ופתיחת תפריט המובייל בפועל (קליק אמיתי על ה-hamburger). הטיפוגרפיה המינימליסטית (Assistant he/en, Cairo ar) נראית נקייה ועקבית; פריסת RTL/LTR תקינה; תפריט המובייל נפתח/נסגר כצפוי עם קישורי ניווט, LocaleSwitcher ו-CTA. **נמצא ותוקן באג DX (לא אבטחה)**: ב-`npm run dev` ה-CSP (`script-src 'self' 'unsafe-inline'` בלי `unsafe-eval`) חסם את עטיפת ה-eval של webpack ב-HMR, ושיברה את כל האינטראקטיביות בצד הלקוח מקומית (התפריט לא נפתח כלל). תוקן ב-`next.config.ts`: `unsafe-eval` מתווסף ל-CSP רק כש-`NODE_ENV !== "production"`; ה-CSP בפרודקשן (כפי שנבדק עם `next start`) נשאר ללא שינוי ומלא. typecheck/lint/test(7)/build ✅, מאומת חזותית ב-3 השפות + desktop/mobile + מצב תפריט פתוח. נדחף. | מיזוג PR #3 לפי שיקול המשתמש; שאר הפריטים הפתוחים (migration Supabase, Vercel KV, הגירת Next 16, תמונות אמיתיות, רכז נגישות, Lighthouse) ללא שינוי. |
| 2026-06-18 | **תפריט מובייל מסך-מלא בהשראת orhayoon.com** (בקשת המשתמש + "תדאג למנוע בעיות אבטחה בכל פיתוח נוסף"). `mobile-nav.tsx` נכתב מחדש: דיאלוג מסך-מלא (לא dropdown) — שורת עליון עם הלוגו + כפתור סגירה, רשימת קישורי ניווט בשורות מלאות עם מפרידים וטקסט גדול (`text-2xl`), שורה תחתונה עם LocaleSwitcher+CTA קביעת תור, בפלטת ink/gold הקיימת. נוספו: נעילת גלילת רקע, סגירה ב-Escape, ו-**focus trap** מלא (Tab/Shift+Tab לא בורחים מהדיאלוג) — לפי דפוס WAI-ARIA Dialog; `role="dialog"`+`aria-modal`+`aria-labelledby`. סקיל security הופעל מראש על הקוד החדש: אין קלט משתמש חדש, אין XSS (כל הטקסט מ-`next-intl` קבוע), קישורי `target=_blank` כבר עם `rel="noopener noreferrer"` — אין ממצאי Critical/High/Med; ה-LOW היחיד (חוסר focus-trap) תוקן כחלק מהבנייה. **נמצאו ותוקנו 2 בעיות רינדור אמיתיות ב-QA חזותי (Playwright)**: (1) הדיאלוג (`fixed inset-0`) "נכלא" בגובה ה-header במקום לכסות את כל המסך — כי ל-header יש `backdrop-blur` (backdrop-filter), שיוצר containing block ל-`position:fixed` ב-Chromium; תוקן ע"י `createPortal` ל-`document.body`. (2) הכפתורים הצפים (וואטסאפ/טלפון `z-[55]`, נגישות `z-[60]`) הציפו מעל שורת ה-CTA בתחתית התפריט; תוקן ע"י העלאת ה-z-index של הדיאלוג ל-`z-[70]`. גם `booking-link.tsx` קיבל `onClick` אופציונלי (כדי שהתפריט יסגר בלחיצה על קביעת תור). אומת חזותית בשלוש השפות (he/en/ar) + Escape סוגר + scroll-lock עובד + ניווט בלחיצה על קישור סוגר ומנווט. typecheck/lint/test(7)/build ✅. | מיזוג PR #3; שאר הפריטים הפתוחים ללא שינוי. |
| 2026-06-18 | **דיוק נוסף לתפריט המובייל** בעקבות משוב המשתמש "לא שינית את התפריט כמו שביקשתי" אחרי הבנייה הקודמת. בדיקה חזותית מחדש (build+start+Playwright, container חדש) אישרה שהתפריט המסך-מלא תקין ופונקציונלי, אך פריסת השורה העליונה והדגשת הפריט הראשון לא תאמו במדויק את תמונת הייחוס מ-orhayoon.com. תוקן ב-`mobile-nav.tsx`: (1) שורת העליון הפכה ל-grid תלת-טורי כך שהלוגו ממורכז ביחס לרוחב המסך (לא רק לרווח שנותר אחרי הכפתור), עם כפתור הסגירה בפינה; (2) פריט הניווט הראשון מקבל רקע מודגש (`bg-white/5`) כדי לשקף את שורת ה"דף הבית" המודגשת בייחוס — ה-padding האופקי הועבר מה-`<nav>` לכל קישור כדי שהרקע ימשוך לכל רוחב המסך. אומת חזותית ב-he (RTL, רקע מודגש על "אודות"+לוגו ממורכז) ו-en (LTR, מירור תקין). typecheck/lint/test(7)/build ✅. נדחף. | מיזוג PR #3; שאר הפריטים הפתוחים ללא שינוי. |
| 2026-06-18 | **החלפת צבע ה-accent (זהב/"כתום") לאפור בהיר**, בקשת המשתמש לפי תמונת ייחוס (לוגו ReStyle באפור בהיר על רקע אפור מחוספס). נדגם הצבע מהתמונה בפועל (פענוח JPEG, ממוצע פיקסלים בוהקים של האותיות) — כ-`rgb(231,231,231)`; נבחר `#e5e5e5` (תואם לצבע גוף הטקסט הקיים באתר) ו-`#cfcfcf` ל-hover. השינוי בוצע בנקודה אחת בלבד — `--color-accent`/`--color-accent-soft` ב-`globals.css` (טוקני `@theme` של Tailwind v4) — ומתפשט אוטומטית לכל שימושי `bg-accent`/`text-accent`/`border-accent` בכל האתר (כפתורי CTA, focus ring, footer, ניווט, טפסים, ווידג'ט נגישות וכו'). עודכן גם ה-favicon (`icon.svg`, ה-"R" הזהב) לאותו אפור — נבדק קונטרסט תקין על רקע ה-ink הכהה. אומת חזותית: דף הבית (desktop) — כפתור "קביעת תור" אפור בקונטרסט טוב; תפריט המובייל — כפתור ה-CTA התחתון אפור. typecheck/lint/test(7)/build ✅. נדחף. | בדיקת קונטרסט מלאה (WCAG AA) על כל מקומות השימוש ב-accent (לא רק הכפתורים שנבדקו); מיזוג PR #3; שאר הפריטים הפתוחים ללא שינוי. |
| 2026-06-18 | **מרקם בטון מחוספס על אלמנטי ה-accent**, בקשת המשתמש בעקבות תמונת הייחוס. נוסף `.bg-concrete` ב-`globals.css`: רעש SVG פרוצדורלי (`feTurbulence`, ללא תמונה/נכס חיצוני) ממוזג מעל `--color-accent` עם `background-blend-mode: multiply`. הוחל במקום `bg-accent` הליטרלי בכל שלושת המקומות שבהם הצבע משמש כמילוי-רקע (לא טקסט/border): כפתור CTA ראשי (`button.tsx`), כפתור הטלפון הצף (`floating-contact.tsx`), וכפתור+שבבי הבחירה בווידג'ט הנגישות (`accessibility-menu.tsx`). לפני push, נשלח למשתמש צילום תקריב של הכפתור + צילום דף הבית לאישור (בעקבות שאלת היקף שנשאלה ונענתה: "כפתורים ואלמנטים"). typecheck/lint/test(7)/build ✅. נדחף. | אישור סופי של המשתמש על המרקם; טיפול בבקשה הבאה ("מלל לבן בולט"); מיזוג PR #3; שאר הפריטים הפתוחים ללא שינוי. |
| 2026-06-18 | **מלל לבן ובולט בכפתורי ה-CTA** (בקשת המשתמש "מלל לבן בולט" — אומת מולו שמדובר בטקסט בכפתורים, לא ב-hero/footer). `button.tsx` variant `primary`: `text-ink`→`text-white font-bold` + `[text-shadow:0_1px_3px_rgb(0_0_0_/_0.6)]` לשמירה על קריאות מעל מרקם הבטון הבהיר (טקסט לבן על אפור-בהיר בלי shadow היה נכשל בקונטרסט WCAG). אומת חזותית בזום גבוה (deviceScaleFactor 3) — קריא וברור. typecheck/lint/test(7)/build ✅. נדחף. | מיזוג PR #3; שאר הפריטים הפתוחים ללא שינוי. |
| 2026-06-18 | **הוחזר** המלל בכפתור ה-CTA הראשי ל-`text-ink` (לפני: `text-white font-bold`+text-shadow) — בעקבות "תחזיר לקודם, לא אהבתי בלי המחוספס": הטקסט הלבן/בולט הסתיר את מרקם הבטון הבהיר ופגע באפקט המחוספס שהמשתמש רצה לראות. `bg-concrete` (מרקם הבטון עצמו) נשאר ללא שינוי. typecheck/lint/test(7)/build ✅. נדחף. | מיזוג PR #3; שאר הפריטים הפתוחים ללא שינוי. |
| 2026-06-18 | **הוסר מרקם הבטון המחוספס לחלוטין** — בעקבות תיקון המשתמש: "התכוונתי לחזור אחורה בלי האפור המחוספס, האפור שהיה לפני כן טוב יותר" (לא הייתה כוונה לשמר את המרקם, אלא לחזור לאפור השטוח). הוסרו כללי `.bg-concrete`/`.bg-concrete:hover` מ-`globals.css`; שלושת המקומות שהשתמשו בהם (`button.tsx`, `floating-contact.tsx`, `accessibility-menu.tsx`) חזרו ל-`bg-accent`. תוקן גם `hover:bg-accent-soft` שאבד ב-`button.tsx` בזמן הוספת המרקם (ה-hover נוהל אז ע"י כלל CSS של `.bg-concrete:hover` בלבד). אומת חזותית (build+start+Playwright): כפתור CTA, ווידג'ט נגישות וכפתור טלפון — אפור שטוח `#e5e5e5`/`#cfcfcf` ב-hover, ללא מרקם. typecheck/lint/test(7)/build ✅. נדחף. | מיזוג PR #3; שאר הפריטים הפתוחים ללא שינוי. |
| 2026-06-19 | **סנכרון מסמכים לפני מעבר לסשן חדש** (בקשת המשתמש "תעדכן את כל המסמכים והסקילים"). נסקרו כל המסמכים (`docs/DESIGN.md`, `docs/ARCHITECTURE.md`, `docs/TASKS.md`, `docs/QUOTE.md`) וכל 4 הסקילים (`.claude/skills/*`) לאיתור פערים מהמצב בקוד. נמצא ותוקן פער ב-`docs/DESIGN.md`: תיאר עדיין את הצבע המקורי (`#C9A227` זהב/ברונזה) וגופנים שהוחלפו (Heebo/Ploni) — עודכן לפלטה ולטיפוגרפיה הנוכחיים (אפור `#E5E5E5` שטוח ללא מרקם; Assistant/Cairo). תיבת "🚦 להתחיל מכאן" ברודמאפ נכתבה מחדש — הייתה משקפת מצב bootstrap ישן (env/migrations מ-Phase 1) ולא את המצב האמיתי כיום (מסלול הבסיס מושלם, 4 סבבי pentest בוצעו, i18n+a11y+מובייל גמורים). 4 הסקילים נבדקו ונמצאו ללא תוכן מיושן (הם מתודולוגיים, לא תלויי-מצב-נוכחי). typecheck/lint/test(7)/build ✅ (לא נגעו בקוד). | המשתמש עובר לסשן חדש; שאר הפריטים הפתוחים (migration Supabase, Vercel KV, תמונות אמיתיות, רכז נגישות, Lighthouse, מיזוג PR #3) ללא שינוי — ראה תיבת "🚦 להתחיל מכאן" המעודכנת. |
| 2026-06-19 | **נוסף סקיל חמישי — `tranzila-payments`** (בקשת המשתמש: "תוסיף סקיל מיוחד" לחיבור סליקת אשראי, בציון שזה קריטי 10/10 — באג כאן "האתר יקום ויפול עליו"). נוצר `.claude/skills/tranzila-payments/SKILL.md`: מנחה להעדיף hosted-fields/iframe של טרנזילה (לא להעביר פרטי כרטיס בשרת שלנו → scope PCI מצומצם), זרימת עסקה עם אימות סכום בשרת מה-DB, אימות callback/webhook (חתימה או קריאת status נוספת — לא לסמוך על redirect בצד-לקוח), idempotency, אי-אחסון PAN/CVV, הפרדת סביבת sandbox/production, וצ'קליסט אבטחה ייעודי שמופעל **לצד** סקיל `security`, לא במקומו. עודכן `CLAUDE.md` §"הסקילים" (4→5 סקילים). אין עדיין קוד תשלומים בפועל — זה תכנון-מתודולוגי בלבד, ממתין לפתיחת Phase 4/5 (הרחבה אופציונלית) ולפרטי API מהמשתמש. **תיקון**: המשתמש הבהיר שאין לו ניסיון אישי קודם בחיבור טרנזילה (זו הייתה תגובה ששמע ממישהו אחר) — וביקש מחקר אינטרנט אמיתי על האופן הנכון/מאובטח לחבר. בוצע מחקר (WebSearch+WebFetch מול `docs.tranzila.com` ותיעוד צד-ג') ועודכן הסקיל עם פרטים ממוקדי-מקור: שלושת מסלולי האינטגרציה הרשמיים (Iframe=SAQ-A מומלץ, Hosted Fields=SAQ-A-EP, API V2=SAQ-D להימנע), אימותים (terminal+TranzilaPW ל-iframe; app key+secret+HMAC ל-API V2), דגם `error_code:0`=הצלחה, ואזהרה מפורשת שמנגנון חתימת ה-callback **לא אומת במחקר** ולכן יש לאמת מול התיעוד הרשמי בזמן המימוש ולא לסמוך רק על callback בלי קריאת אימות נוספת. הוסרה הטענה השגויה על "ניסיון קודם של המשתמש". | אם/כשהלקוח יבחר בהרחבה (חנות+תשלומים): `planning` ייעודי לפי הסקיל המעודכן לפני קוד, עם קריאה בפועל בדפי התיעוד הרשמי (לא רק תוצאות חיפוש). שאר הפריטים הפתוחים ללא שינוי. |
| 2026-06-19 | **מערכת תנועה + סקיל UI/UX חדש** (בקשת המשתמש: "תוסיף אנימציות... חדשני ומגניב; תיצור סקיל Ui/Ux; תתכנן כמו מעצב גרפי ואז תיישם"). זרימה מלאה: planning → ui-ux (קונספט+טוקנים) → development → qa. **(1) נוצר סקיל חמישי-לעיצוב `.claude/skills/ui-ux/SKILL.md`** — קונספט "מינימליזם קינטי", עקרונות תנועה (תכלית/עדינות/ביצועים transform+opacity בלבד/RTL ציר-Y), סקאלת טוקנים (easing+duration+stagger), אינוונטר ספרייה, ו**חובת נגישות** (reduced-motion + a11y-no-motion). עודכן `CLAUDE.md` (5→6 סקילים). **(2) מערכת תנועה ב-`globals.css`**: טוקני `:root` (`--ease-out`/`--ease-in-out`/`--dur-*`), keyframes (fade-up/fade-in/scale-in/hero-zoom), utility classes (`.animate-*` עם `fill-mode: both`), `.btn-shine` (הבזק מתכתי), `.link-underline` (קו נמתח RTL-safe). **(3) תוקן פער נגישות אמיתי**: ה-`@media (prefers-reduced-motion: reduce)` השבית רק smooth-scroll — הורחב לאיפוס אנימציות/מעברים גלובלי (משך זעיר ולא `none`, כדי שתוכן עם fill-mode יסתיים גלוי). **(4) קומפוננטות**: `<Reveal>` הורחב ב-`direction`+`delay` (תאימות לאחור); כניסת Hero מדורגת (fade-up eyebrow→title→subtitle→CTA) + Ken Burns על הרקע; `button.tsx` primary/light עם `.btn-shine`; `ImagePlaceholder` עם זום hover + overlay accent (group, מוכן לתמונות אמיתיות); קישורי ניווט עם `.link-underline`; stagger בגריד שירותים/גלריה/המלצות. תיעוד ב-`docs/DESIGN.md` §תנועה. **QA**: typecheck/lint/test(7)/build ✅; Playwright — Hero מתייצב גלוי, ובמצב reduced-motion `h1` ב-`opacity:1` מיידית (אומת שתוכן לא תלוי באנימציה). נדחף. | בדיקת קונטרסט/Lighthouse כללית עדיין פתוחה; שאר הפריטים ללא שינוי. אפשר להוסיף page-transitions ו-micro-interactions לטפסים בעתיד אם יתבקש. |
| 2026-06-20 | **שיפור UI/UX מבוסס-גלילה (mobile-first)** — בעקבות משוב המשתמש "לא רואה שינוי כל כך במובייל; תחשוב בכללי איך לשפר את כל האתר". **אבחון שורש**: רוב האנימציות מהסבב הקודם היו `:hover` (btn-shine/link-underline/image-zoom) — בלתי-נראות במסכי מגע. **פתרון (סקיל ui-ux → development → qa)**: (1) **Header חכם** (`site-header.tsx` הומר ל-client) — מתמצק בגלילה (`bg-ink/95`+צל, שקוף-יחסית בראש), ו-auto-hide: נעלם בגלילה מטה / מתגלה בגלילה מעלה (scroll listener עם rAF throttle). (2) **פס התקדמות גלילה** (`scroll-progress.tsx`) — קו accent דק בראש, ממלא מצד ההתחלה הלוגי (RTL=ימין/LTR=שמאל). (3) **חיווי "גלול" ב-Hero** — chevron מרחף (`@keyframes float`/`.animate-float`). (4) **ריתמוס מובייל** — ריווח אנכי מצומצם (`py-24`→`py-16 sm:py-24`, `py-20`→`py-14 sm:py-20`) לצמצום רווחים ריקים גדולים שהתגלו ב-QA חזותי. **QA Playwright (390px mobile)**: אומת ש-Header מסתתר (`translate: 0 -100%`) בגלילה מטה ומתגלה+מתמצק (bg alpha 0.95) בגלילה מעלה; chevron+progress נראים; reduced-motion נשמר (התוכן גלוי, התנועה מאופסת ע"י ה-guard הגלובלי). typecheck/lint/test(7)/build ✅. נדחף. | אם המשתמש רוצה עוד — page-transitions בין עמודים, micro-interactions בטפסים, גלריה דינמית (masonry). שאר הפריטים הפתוחים ללא שינוי. |
| 2026-06-20 | **חוויית לקוח — ניווט פעיל, סרגל הזמנה צמוד-מובייל, וטופס צור קשר** (בקשת המשתמש: "תתמקד בחוויות UI/UX של הלקוח... תקח דוגמאות מהאתרים המובילים בעולם"). (1) **חיווי "עמוד פעיל" בניווט** — `site-header.tsx`/`mobile-nav.tsx` עם `usePathname` אמיתי (לא hardcoded): `aria-current="page"` + הדגשה (קו תחתון תמיד-גלוי בדסקטופ, `bg-white/5 text-accent` במובייל). (2) **`MobileBookingBar`** (קומפוננטה חדשה) — סרגל "קביעת תור" צמוד-תחתית במובייל בלבד, מופיע רק אחרי גלילה מעבר ל-CTA של ה-Hero (דפוס נפוץ באתרי הזמנה מובייל מובילים); `floating-contact.tsx` הורם (`bottom-20`→`bottom-4` מ-`sm:`) כדי לא להתנגש עם הסרגל. (3) **טופס צור קשר** (`contact-form.tsx`) — ניקוי שגיאת שרת אוטומטי בעריכת שדה, `aria-invalid`/`aria-describedby` על שדות עם שגיאה, `role="alert"` על שגיאת שרת, ספינר טעינה בכפתור השליחה (`motion-reduce:animate-none`), ומסך הצלחה משודרג עם אייקון. **תיקון נגישות אגבי שהתגלה בדרך**: ה-`outline`/`ghost` variants ב-`button.tsx` היו עם `text-paper` קשיח — נכשל קונטרסט על סקציות בהירות (`bg-paper`); תוקן בסבב הבא (ראה רשומה הבאה) ל-`text-current`. **QA Playwright**: אומת `aria-current` בדסקטופ+מובייל, מעבר `translate` של הסרגל הצמוד בגלילה. typecheck/lint/test(7)/build ✅. | מעבר לבקשת המשתמש הבאה — עיצוב מבוסס אפליקציית ReStyle (ראה רשומה הבאה). |
| 2026-06-20 | **תיקון UX — סרגל הזמנה חוזר לראש העמוד במובייל** (משוב מפורש של המשתמש: "לא אוהב את הכפתור קביעת תור מלמטה, העדפתי כמו קודם שהלמעלה מלווה אותי עם התפריט והקביעת תור"). ה-`MobileBookingBar` שנוסף בסבב קודם (סרגל "קביעת תור" צמוד-תחתית במובייל) **הוסר לחלוטין** — לא היה רצוי, פגע בחוויה הקודמת שהמשתמש אהב. `mobile-booking-bar.tsx` נמחק; הוסרה הקריאה לו מ-`layout.tsx`. במקום זאת, כפתור "קביעת תור" הקיים ב-`site-header.tsx` (היה `hidden sm:inline-flex`) הפך גלוי גם במובייל, כך שהוא יושב לצד כפתור ההמבורגר באותו header עליון שמתמצק/נעלם/מתגלה בגלילה — תואם בדיוק לציפיית המשתמש שהראש "מלווה" אותו עם התפריט והקביעת תור יחד. `floating-contact.tsx` הוחזר ל-`bottom-4` הפשוט (לא נדרש עוד clearance לסרגל שהוסר). אומת חזותית ב-Playwright (iPhone 12 viewport): הכפתור מופיע בראש מההתחלה, וגלילה מעלה אחרי גלילה מטה מגלה את שניהם (תפריט+כפתור) כיחידה אחת. typecheck/lint/test/build ✅. נדחף (`406767b`). | המשתמש שלח תמונת סטודיו אמיתית לשילוב באתר; שאר הפריטים הפתוחים ללא שינוי. |
| 2026-06-20 | **שילוב תמונת סטודיו אמיתית בגלריה** (המשתמש שלח צילום שחור-לבן של פנים הסטודיו; נשאל באמצעות `AskUserQuestion` היכן להשתמש בה — Hero/גלריה/אודות-אקדמיה — והמשתמש בחר **רק** "סקציית גלריה"). התמונה הועתקה ל-`public/images/gallery-studio-1.jpg`. נוספו מפתחות תרגום `studioImageLabel` (he/en/ar) בשני ה-namespaces הרלוונטיים (`home` ו-`gallery`) בכל קובצי `messages/*.json`. בשתי המיקומים (סקציית הגלריה בדף הבית `page.tsx`, והעמוד הייעודי `gallery/page.tsx`) הוחלף אריח `ImagePlaceholder` ראשון אחד ב-`<Image fill>` אמיתי עם `object-cover` בתוך wrapper `relative aspect-square overflow-hidden` (אותה טביעת-רגל CSS כמו ה-placeholder, כדי שישתלב בגריד הקיים ללא שינוי מבנה) — נשאר עטוף ב-`<Reveal direction="scale">` הקיים לעקביות אנימציית הכניסה. מספר ה-placeholders הנותרים פחת בהתאם (8→7 בדף הבית, 12→11 בעמוד הגלריה). אומת חזותית ב-Playwright: גם העמוד הייעודי וגם סקציית הגלריה בדף הבית מציגים את התמונה האמיתית כאריח הראשון, לצד שאר ה-placeholders. typecheck/lint/test/build ✅. | Hero/אקדמיה/אודות נשארים placeholder עד שיתקבלו תמונות נוספות מהמשתמש; commit+push לסבב הזה; שאר הפריטים הפתוחים ללא שינוי. |
| 2026-06-20 | **שינוי כתובת** (בקשת המשתמש: "שנה כתובת ל לסקוב 4 תל אביב"). עודכן `siteConfig.contact.address` ב-`src/lib/config.ts` (`"חיים לסקוב 4, תל אביב"`→`"לסקוב 4, תל אביב"`) — מקור אמת יחיד שמתפשט אוטומטית לכל מקומות השימוש (דף הבית, צור קשר, מיקום ושעות, קישור Waze, meta descriptions). typecheck/lint/test/build ✅. נדחף (`66243e0`). | שאר הפריטים הפתוחים ללא שינוי. |
| 2026-06-20 | **תמונת הסטודיו גם בסקציית "אודות" בדף הבית** (המשתמש שם לב: "יש מקום שרשום תמונת סטודיו והוא ריק" — הצביע על ה-`ImagePlaceholder` בסקציית "אודות תקציר" בדף הבית, label=`aboutImageLabel`="תמונת הסטודיו", שנשאר placeholder בסבב הקודם כי המשתמש בחר במפורש רק "גלריה" כשנשאל). הוחלף ה-`ImagePlaceholder` ב-`<Image fill>` אמיתי של אותה תמונה (`gallery-studio-1.jpg`) באותו wrapper `relative aspect-[16/9] sm:aspect-[21/9] overflow-hidden`, בתוך `<Reveal>` הקיים. אומת חזותית ב-Playwright (מובייל) — התמונה ממלאת את הבאנר הרחב בסקציית האודות כצפוי. typecheck/lint/test/build ✅. נדחף. | אקדמיה (`academyImageLabel`) ו-Hero נשארים placeholder עד הוראה נוספת; שאר הפריטים הפתוחים ללא שינוי. |
| 2026-06-20 | **פיבוט מיתוג — צבעים ועיצוב לפי אפליקציית ReStyle** (בקשת המשתמש בצירוף 3 צילומי מסך מהאפליקציה האמיתית: "תשתמש בצבעים ובעיצוב של האפליקציה"). זוהה כשינוי כיוון מיתוג מהותי (לא תיקון קוסמטי) — הוחלף לשון העיצוב מ-"menspire, אפור שטוח, כפתורים מרובעים" ל-מונוכרום שחור-לבן בהשראת **האפליקציה עצמה**, עם משטחי כרטיס בקרם חם. **(1) `button.tsx`** — שינוי מרכזי: כפתורים הפכו ל-**pill מלא** (`rounded-full`, היה `rounded-md`); `primary`=pill שחור (`bg-ink`/טקסט לבן) לרקעים בהירים, `light`=pill לבן (`bg-white`/טקסט שחור) לרקעים כהים (היפוך-קונטרסט); `outline`/`ghost` עברו ל-`text-current`/`border-current`/`bg-current` — **תיקון באג ניגודיות אמיתי** שהתגלה בדרך: הם היו קודם עם `text-paper` קשיח שנכשל קונטרסט מעל רקעים בהירים. **(2)** טוקן צבע חדש `--color-cream` (`#f0e9dc`, בהשראת כרטיס התור באפליקציה) ב-`globals.css`, מוחל על כרטיסי "שירותי המספרה" בדף הבית. **(3)** נבדקה ועודכנה **כל** קריאת `buttonVariants` באתר (כ-12 קבצים: `page.tsx`, `site-header.tsx`, `mobile-nav.tsx`, `mobile-booking-bar.tsx`, `contact-form.tsx`, עמודי academy/locations/services, 4 טפסי auth) — כל קריאה נבחנה ידנית מול הרקע בפועל של הסקציה (body כהה כברירת מחדל מול סקציות `bg-paper`/`bg-cream` בהירות) כדי לבחור `primary` או `light` בהתאם, ולא Find&Replace גלובלי שעלול לייצר כפתורים בלתי-נראים בהקשר הלא נכון. **QA**: typecheck/lint/test(7)/build ✅; אומת חזותית ב-Playwright (desktop+מובייל) — Hero, כרטיסי שירותים קרם, סקציית CTA כהה, אודות/גלריה/מיקום (outline על רקעים כהים/בהירים), תפריט מובייל, סרגל הזמנה צמוד, טופס צור קשר, מסך התחברות — כל הכפתורים בקונטרסט נכון; אומת בקוד (`getComputedStyle`) שצבעי הכפתורים בפועל הם `rgb(14,14,14)`/`rgb(255,255,255)` כמתוכנן. תועד ב-`docs/DESIGN.md` (§פלטת צבעים + §כפתורים חדש). עדיין לא נדחף. | commit+push (ממתין להוראת המשתמש); ראיית `docs/DESIGN.md` לתמונות נוספות אם תתבקש הרחבה (למשל badge "Bronze"/אווטארים בכרטיסי לקוח); שאר הפריטים הפתוחים ללא שינוי. |
| 2026-06-20 | **4 אפקטי אנימציה פרימיום בהשראת רפרנס סקרולינג למוצר** (המשתמש שלח הקלטת מסך של עמוד נחיתה למוצר פרימיום: "רציתי אנימציות בסגנון הזה". זוהו ב-ffmpeg+סקירה חזותית 4 טכניקות נפרדות; נשאל באמצעות `AskUserQuestion` (multi-select) אילו מהן ליישם — המשתמש בחר **את כל הארבע**). זרימה: `ui-ux` (קונספט, נמנע מ-scroll-jacking האסור לפי הסקיל) → development → qa. **(1) טבעות פולסציה** (`.pulse-ring` ב-`globals.css`, `::before`/`::after` עם `currentColor`, `scale`+`opacity` בלבד) — על כפתור הוואטסאפ הצף (`floating-contact.tsx`; אנכור הצבע הירוק לטבעת תוקן עם `[&>svg]:text-white` כדי שהאייקון עצמו יישאר לבן). **(2) רקעי glow** (`.glow-orb`, `radial-gradient`+`blur`, דקורטיבי) — בסקציות CTA/המלצות בדף הבית ובראש עמוד האקדמיה. **(3) קווי הדגשה זוהרים** (`.feature-glow-dot`/`.feature-glow-line`, סטייל Apple feature-callout) — על תמונת הסטודיו בסקציית "אודות" בדף הבית (תאורה/כיסאות/עיצוב); ממוקם עם `start-*` לוגי + `rtl:-scale-x-100` להיפוך נכון של הגרדיאנט הפיזי בעברית/ערבית; מוסתר במובייל. **(4) סיפור-גלילה ללא scroll-jacking** — קומפוננטה חדשה `<ScrollFeature>` (`components/scroll-feature.tsx`, אותו דפוס `IntersectionObserver`+`rootMargin` כמו `<Reveal>`): תמונה `sticky` + טקסט גולש שמודגש/מועם לפי קרבה למרכז המסך, ללא pin בג'אווהסקריפט; בשימוש בעמוד האקדמיה (`academy/page.tsx`). נוספו מפתחות תרגום `studioFeatureLighting`/`studioFeatureChairs`/`studioFeatureDesign` ב-he/en/ar. **QA**: typecheck/lint/test/build ✅; Playwright — אומתו חזותית כל 4 האפקטים (כולל sticky+scrollytelling באקדמיה); אומת ב-`getComputedStyle` שהטבעת רצה (`animation-duration: 2.4s`) במצב רגיל וקופאת לפריים יחיד (`1e-06s`, `iteration-count:1`) תחת `reducedMotion:'reduce'`, ושטקסט ה-`ScrollFeature` מוצג ב-`opacity:1` מיידית תחת reduced-motion (לא תלוי בגלילה). תועד ב-`docs/DESIGN.md` §"אפקטים פרימיום נוספים". | בדיקת קונטרסט/Lighthouse כללית עדיין פתוחה; מיזוג PR #3; שאר הפריטים הפתוחים ללא שינוי. |
