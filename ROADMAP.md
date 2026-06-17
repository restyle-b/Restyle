# ROADMAP — Restyle 🪒

> **קובץ מנחה ומקור האמת להתקדמות הפרויקט.**
> מתעד מה כבר עשינו ✅, מה בעבודה 🔄, ומה נשאר ⬜.
> **לעדכן לפני סיום כל סשן** (לפי הוראת המשתמש) + להוסיף רשומה ל-Session Log בתחתית.

מקרא: ✅ הושלם ונבדק (QA) · 🔄 בעבודה · ⬜ לא התחיל · ⏸️ ממתין/חסום

---

## 🚦 להתחיל מכאן בסשן הבא — קריטי!

**מצב:** Phase 2 (אתר תדמית) ברובו מוכן. ה-DB עדיין לא מאומת בפועל — ה-sandbox
ממשיך לחסום TCP ל-Postgres גם עם "Network Access: Full" (רק HTTPS עובד; ייתכן
שזו מגבלת sandbox כללית ולא תלויה בהגדרה הזו). **אל תבזבז זמן בלהילחם בזה —
המשך ב-Phase 2 / Phase 3 קוד-בלבד ותחזור לבדיקת ה-DB מתישהו עם `migrate status`.**

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
- קישורי אפליקציית Restyle (App Store / Google Play / web) ל-`src/lib/config.ts`
  (`siteConfig.booking`) — עדיין placeholders (`#`).
- פרטי קשר אמיתיים (`siteConfig.contact`) — כרגע ריקים, מוצג "יפורסם בקרוב".

---

## חזון
אתר מספרה פרימיום (בהשראת menspire.com): חנות מוצרים, אקדמיה, אזור אישי מאובטח,
ניהול הזמנות, ממשק ניהול מתקדם, ותשתית תשלומים (Tranzila/HYP בעתיד).

## סיכום סטטוס נוכחי
- **שלב נוכחי:** Phase 2 — אתר תדמית (עיקרו מוכן: דף בית מלא, אודות, שירותים,
  גלריה, צור קשר עם טופס+server action, SEO בסיסי).
- **הבא בתור:** ראה תיבת "🚦 להתחיל מכאן" למעלה — Phase 2 שאריות, ואז Phase 3.
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

## Phase 3 — אימות ואזור אישי ⬜
- [ ] ⬜ Supabase Auth (אימייל/OTP) + הרשמה/התחברות/איפוס
- [ ] ⬜ middleware הגנת נתיבים + ניהול roles (user/admin)
- [ ] ⬜ דשבורד אזור אישי (פרופיל, הזמנות, קורסים, תורים)
- [ ] ⬜ RLS ב-Supabase + סקירת security

## Phase 4 — חנות (E-commerce) ⬜
- [ ] ⬜ מודל מוצרים/קטגוריות/מלאי (Prisma)
- [ ] ⬜ קטלוג + עמוד מוצר + חיפוש/סינון
- [ ] ⬜ עגלת קניות
- [ ] ⬜ צ'קאאוט (חישוב סכום בשרת באגורות, משלוח, קופונים)
- [ ] ⬜ אינטגרציית אחסון תמונות R2

## Phase 5 — תשתית תשלומים ⬜
- [ ] ⬜ interface `PaymentProvider` + מתאם Mock
- [ ] ⬜ זרימת checkout → תשלום → callback מאומת (HMAC) → idempotency
- [ ] ⬜ תשתית מוכנה לחיבור Tranzila/HYP (ללא חיבור בפועל בשלב זה)

## Phase 6 — ניהול הזמנות ⬜
- [ ] ⬜ מודל הזמנה + מחזור חיים (pending→paid→fulfilled→...)
- [ ] ⬜ היסטוריית הזמנות למשתמש
- [ ] ⬜ מיילי אישור (Resend)

## Phase 7 — אקדמיה ⬜
- [ ] ⬜ מודל קורסים/שיעורים/הרשמות
- [ ] ⬜ קטלוג קורסים + עמוד קורס
- [ ] ⬜ הרשמה/רכישת קורס + גישת תוכן למשתמש רשום

## Phase 8 — ממשק ניהול (Admin) ⬜
- [ ] ⬜ דשבורד אדמין + נתוני מפתח
- [ ] ⬜ ניהול מוצרים/מלאי
- [ ] ⬜ ניהול הזמנות (עדכון סטטוס, חיפוש)
- [ ] ⬜ ניהול קורסים/הרשמות
- [ ] ⬜ ניהול תוכן וגלריה (העלאה ל-R2)
- [ ] ⬜ ניהול משתמשים/הרשאות

## Phase 9 — חיבור לאפליקציית Restyle (קביעת תור) ⬜
> אין ניהול תורים באתר — קיימת אפליקציית Restyle. ה-CTA "קביעת תור" מפנה אליה.
- [ ] ⬜ קונפיג קישורי האפליקציה (App Store / Google Play / קישור web)
- [ ] ⬜ כפתורי "קביעת תור" → אפליקציה לאורך האתר (Hero, ניווט, סקציה ייעודית)
- [ ] ⬜ סקציית "הורד את האפליקציה" בדף הבית

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
