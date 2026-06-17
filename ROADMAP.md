# ROADMAP — Restyle 🪒

> **קובץ מנחה ומקור האמת להתקדמות הפרויקט.**
> מתעד מה כבר עשינו ✅, מה בעבודה 🔄, ומה נשאר ⬜.
> **לעדכן לפני סיום כל סשן** (לפי הוראת המשתמש) + להוסיף רשומה ל-Session Log בתחתית.

מקרא: ✅ הושלם ונבדק (QA) · 🔄 בעבודה · ⬜ לא התחיל · ⏸️ ממתין/חסום

---

## חזון
אתר מספרה פרימיום (בהשראת menspire.com): חנות מוצרים, אקדמיה, אזור אישי מאובטח,
ניהול הזמנות, ממשק ניהול מתקדם, ותשתית תשלומים (Tranzila/HYP בעתיד).

## סיכום סטטוס נוכחי
- **שלב נוכחי:** Phase 1 — Scaffolding (רוב המשימות הושלמו; נותרו תלויות-חשבונות).
- **הבא בתור:** השלמת חיבורים חיים (Supabase/Vercel) ואז Phase 2 — אתר תדמית.
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
