# ROADMAP — Restyle 🪒

> **קובץ מנחה ומקור האמת להתקדמות הפרויקט.**
> מתעד מה כבר עשינו ✅, מה בעבודה 🔄, ומה נשאר ⬜.
> **לעדכן לפני סיום כל סשן** (לפי הוראת המשתמש) + להוסיף רשומה ל-Session Log בתחתית.

מקרא: ✅ הושלם ונבדק (QA) · 🔄 בעבודה · ⬜ לא התחיל · ⏸️ ממתין/חסום

---

## 🚦 להתחיל מכאן בסשן הבא — קריטי!

**מצב:** עצרנו באמצע Phase 1, ממתינים לסשן חדש עם **Network Access: Full**
(המשתמש כבר הגדיר את זה ב-Environment Settings; חל רק על סשנים חדשים).

### מה כבר קיים ב-container (לא צריך לשחזר):
- `.env.local` כבר מלא עם 4 הערכים מ-Supabase: `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`
  (פרויקט Supabase: `rgivretfxunsvbeimtnu`, region Frankfurt, pooler חיבור
  transaction על פורט 6543). **קובץ זה לא ב-git** (.gitignore) — אם פותחים
  container חדש מאפס (לא ממשיכים את אותו אחד), הוא לא יהיה קיים ויש לבקש
  מהמשתמש להזין מחדש (ראה `docs/SETUP.md`).
- Migration ראשונה (`users` table + `Role` enum) — **כבר רץ בפועל ב-Supabase**
  דרך SQL Editor (כי הסשן הקודם לא היה לו גישת רשת ל-Postgres). הקובץ קיים גם
  ב-`prisma/migrations/20260617000000_init/` ונדחף ל-git.
- R2 / Resend — **עדיין לא הוקמו**. לא חוסם Phase 2, יידרש ב-Phase 4 / Phase 2 (טופס יצירת קשר).
- Vercel — המשתמש עדיין לא אישר חיבור הריפו. לא חוסם המשך פיתוח מקומי.

### צ'קליסט פתיחה לסשן הבא:
1. `git status` ו-`git log -1` — לאשר שה-branch מסונכרן (אמור להיות `ec90ef1` או חדש יותר).
2. ודא ש-`.env.local` קיים (`ls -la .env.local`). אם לא — בקש מהמשתמש להזין שוב.
3. בדוק חיבור DB אמיתי עם הרשת המלאה:
   ```bash
   npx prisma db pull --print  # או
   npx prisma migrate status
   ```
   אם מצליח — הרשת אכן "Full" עכשיו. אם לא — עדיין מוגבל, חזרה ל-SQL Editor.
4. אם migrate status מראה שה-migration הראשונה לא רשומה ב-DB (כי היא רצה ידנית
   ב-SQL Editor ולא דרך `prisma migrate`), צריך **לסמן אותה כ-applied** בלי
   להריץ אותה שוב: `npx prisma migrate resolve --applied 20260617000000_init`.
5. מכאן והלאה — migrations חדשות רגילות: `npx prisma migrate dev --name <שם>`.
6. להמשיך ל-**Phase 2 (אתר תדמית)** לפי `docs/TASKS.md` (T2.1 ואילך) ו-`docs/DESIGN.md`.

### דברים שעדיין פתוחים מול המשתמש:
- אישור חיבור Vercel↔GitHub (T1.22) + הזנת 4 משתני הסביבה ב-Vercel Settings.
- Cloudflare R2 (bucket + tokens) — לא דחוף עד Phase 4.
- Resend API key — לא דחוף עד Phase 2 (טופס צור קשר) / Phase 6.
- לוגו + תמונות איכותיות למספרה (ל-Hero/גלריה) — ראה הערה בסוף `docs/DESIGN.md`.
- קישורי אפליקציית Restyle (App Store / Google Play / web) ל-`src/lib/config.ts`
  (`siteConfig.booking`) — עדיין placeholders (`#`).

---

## חזון
אתר מספרה פרימיום (בהשראת menspire.com): חנות מוצרים, אקדמיה, אזור אישי מאובטח,
ניהול הזמנות, ממשק ניהול מתקדם, ותשתית תשלומים (Tranzila/HYP בעתיד).

## סיכום סטטוס נוכחי
- **שלב נוכחי:** Phase 1 — Scaffolding (קוד מוכן; ממתינים לסשן עם רשת מלאה לסנכרון DB).
- **הבא בתור:** ראה תיבת "🚦 להתחיל מכאן" למעלה, ואז Phase 2 — אתר תדמית.
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

## Phase 2 — אתר תדמית (Marketing) ⬜
- [ ] ⬜ דף בית (Hero, שירותים, אודות תקציר, גלריה, CTA)
- [ ] ⬜ עמוד אודות
- [ ] ⬜ עמוד שירותים
- [ ] ⬜ גלריה
- [ ] ⬜ צור קשר + טופס (אנטי-ספאם)
- [ ] ⬜ SEO (metadata, sitemap, OG), נגישות, ביצועים

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
