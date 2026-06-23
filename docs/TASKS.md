# TASKS — פירוק מלא למשימות קטנות

פירוק כל שלב ברודמאפ למשימות אטומיות (כל אחת ~0.5–1 יום, ניתנת לבדיקה עצמאית).
מקרא: ✅ הושלם · 🔄 בעבודה · ⬜ פתוח. עדכן כאן ובמקביל ב-`ROADMAP.md`.

---

## Phase 0 — תכנון ותשתית
- [x] T0.1 בחירת סטאק טכנולוגי
- [x] T0.2 בחירת ספקי אירוח (Vercel/Supabase/R2)
- [x] T0.3 סקיל planning
- [x] T0.4 סקיל development
- [x] T0.5 סקיל qa
- [x] T0.6 סקיל security
- [x] T0.7 CLAUDE.md
- [x] T0.8 ROADMAP.md
- [x] T0.9 docs/ARCHITECTURE.md
- [x] T0.10 README.md
- [x] T0.11 פירוק למשימות (קובץ זה)
- [ ] T0.12 commit + push ראשוני

---

## Phase 1 — Scaffolding ותשתית קוד 🔄
### 1A. אתחול
- [x] T1.1 אתחול Next.js 15 (App Router, TS, src/) — הוקם ידנית
- [x] T1.2 `tsconfig` strict + path aliases (`@/*`) + noUncheckedIndexedAccess
- [x] T1.3 Tailwind v4 + `globals.css` + `postcss.config`
- [x] T1.4 תבנית shadcn (cva + cn) + primitives ראשוניים
- [x] T1.5 Prettier + ESLint (next/core-web-vitals + typescript)
- [x] T1.6 scripts: dev/build/lint/typecheck/test/format/db

### 1B. RTL ועברית
- [x] T1.7 `<html dir="rtl" lang="he">` ב-root layout
- [x] T1.8 פונטים Heebo + Assistant דרך `next/font`
- [x] T1.9 design tokens + RTL (logical properties כברירת מחדל)

### 1C. תשתיות
- [x] T1.10 `lib/env.ts` — אימות משתני סביבה ב-zod (חוזה)
- [x] T1.11 `.env.example` + תיעוד משתנים
- [x] T1.12 Prisma + `schema.prisma` (User+Role) — *חיבור Supabase ממתין למפתחות*
- [x] T1.13 `lib/db.ts` — Prisma client singleton
- [ ] T1.14 migration ראשונה + בדיקת חיבור DB — ⏸️ ממתין ל-DATABASE_URL
- [x] T1.15 Vitest + בדיקת sanity (cn)
- [ ] T1.16 הגדרת Playwright + בדיקת sanity

### 1D. עיצוב בסיס + CI
- [x] T1.17 ערכת עיצוב (צבעים/טיפוגרפיה) — design tokens ב-globals.css
- [x] T1.18 Header + ניווט רספונסיבי
- [x] T1.19 Footer
- [x] T1.20 קומפוננטות UI: Button (cva) + Container — *Input/Card בהמשך לפי צורך*
- [x] T1.21 דף בית (Hero + placeholder)
- [ ] T1.22 חיבור פרויקט ל-Vercel + preview deploy — ⏸️ דורש פעולת משתמש
- [x] T1.23 GitHub Actions: typecheck + lint + test + build על PR

---

## Phase 2 — אתר תדמית (Marketing)
- [x] T2.1 layout משותף ל-marketing — נשאר ה-root layout הקיים; אין עדיין route group נפרד (shop/account/admin עדיין לא קיימים)
- [x] T2.2 Hero section (תמונה גדולה + CTA) — סגנון menspire (placeholder gradient; תמונה אמיתית בהמשך)
- [x] T2.3 סקציית שירותים בדף הבית
- [x] T2.4 סקציית "אודות" תקציר
- [x] T2.5 סקציית גלריה/לפני-אחרי (placeholder images)
- [x] T2.6 סקציית המלצות/לקוחות (טקסטים placeholder)
- [x] T2.7 סקציית CTA + מיקום/שעות
- [x] T2.8 עמוד אודות מלא
- [x] T2.9 עמוד שירותים מלא
- [x] T2.10 עמוד גלריה (placeholder images)
- [x] T2.11 עמוד צור קשר + טופס (zod + הגנת ספאם — honeypot)
- [x] T2.12 server action לשליחת טופס צור קשר (Brevo, עם fallback ללוג כש-BREVO_API_KEY חסר)
- [x] T2.13 SEO: metadata לכל עמוד — ⏸️ OG images ממתינות לתמונות/לוגו אמיתיים
- [x] T2.14 sitemap.xml + robots.txt
- [ ] T2.15 בדיקת נגישות + Lighthouse לעמודים — ⏸️ ממתין לתמונות אמיתיות (alt text, ניגודיות סופית)

---

## Phase 3 — אימות ואזור אישי
- [ ] T3.1 הגדרת Supabase Auth + client/server helpers
- [ ] T3.2 מודל User + role(user/admin) ב-Prisma + sync עם Supabase
- [ ] T3.3 עמוד הרשמה + ולידציה
- [ ] T3.4 עמוד התחברות (אימייל/OTP)
- [ ] T3.5 איפוס סיסמה / magic link
- [ ] T3.6 logout + ניהול session
- [ ] T3.7 middleware הגנת נתיבים (`account/*`, `admin/*`)
- [ ] T3.8 layout אזור אישי + ניווט
- [ ] T3.9 עמוד פרופיל (צפייה/עריכה)
- [ ] T3.10 RLS policies על טבלאות משתמש
- [ ] T3.11 סקירת security לזרימת auth (IDOR, session, rate limit)

---

## Phase 4 — חנות (E-commerce)
- [ ] T4.1 מודל Category ב-Prisma
- [ ] T4.2 מודל Product (priceAgorot, stock, images[]) ב-Prisma
- [ ] T4.3 seed נתוני דמו
- [ ] T4.4 `lib/storage.ts` — presigned upload ל-R2
- [ ] T4.5 עמוד קטלוג + רשת מוצרים
- [ ] T4.6 סינון/מיון לפי קטגוריה/מחיר
- [ ] T4.7 חיפוש מוצרים
- [ ] T4.8 עמוד מוצר בודד
- [ ] T4.9 מודל Cart/CartItem + server actions (הוסף/עדכן/הסר)
- [ ] T4.10 UI עגלת קניות (drawer/עמוד)
- [ ] T4.11 חישוב סכום בשרת (אגורות) + מלאי
- [ ] T4.12 תמיכת קופונים (אופציונלי)
- [ ] T4.13 עמוד צ'קאאוט: כתובת + סיכום
- [ ] T4.14 בדיקות unit לחישובי עגלה/סכום
- [ ] T4.15 בדיקות E2E: גלישה→עגלה→צ'קאאוט

---

## Phase 5 — תשתית תשלומים
- [ ] T5.1 הגדרת interface `PaymentProvider`
- [ ] T5.2 `MockProvider` לפיתוח/בדיקות
- [ ] T5.3 server action: צ'קאאוט → createCheckout → redirect
- [ ] T5.4 route handler ל-callback + אימות חתימה/HMAC
- [ ] T5.5 idempotency על callback (מניעת כפילות)
- [ ] T5.6 חישוב/אימות סכום בשרת בלבד
- [ ] T5.7 שלדי `TranzilaProvider` / `HypProvider` (ללא חיבור בפועל)
- [ ] T5.8 בדיקות unit למתאם mock + callback
- [ ] T5.9 סקירת security לזרימת תשלום

---

## Phase 6 — ניהול הזמנות
- [ ] T6.1 מודל Order + OrderItem (snapshot מחיר) ב-Prisma
- [ ] T6.2 מודל Payment + קישור להזמנה
- [ ] T6.3 מכונת מצבים: pending→paid→fulfilled→cancelled/refunded
- [ ] T6.4 יצירת הזמנה בצ'קאאוט מוצלח
- [ ] T6.5 עמוד היסטוריית הזמנות באזור אישי
- [ ] T6.6 עמוד הזמנה בודדת (פרטים/סטטוס)
- [ ] T6.7 מייל אישור הזמנה (Brevo)
- [ ] T6.8 בדיקות מעברי סטטוס + הרשאות

---

## Phase 7 — אקדמיה
- [ ] T7.1 מודל Course ב-Prisma
- [ ] T7.2 מודל Lesson ב-Prisma
- [ ] T7.3 מודל Enrollment
- [ ] T7.4 עמוד קטלוג קורסים
- [ ] T7.5 עמוד קורס בודד (סילבוס/מחיר/CTA)
- [ ] T7.6 זרימת רכישה/הרשמה לקורס (דרך תשלומים)
- [ ] T7.7 גישת תוכן לקורס למשתמש רשום בלבד
- [ ] T7.8 עמוד "הקורסים שלי" באזור אישי
- [ ] T7.9 בדיקות הרשאות גישה לתוכן

---

## Phase 8 — ממשק ניהול (Admin)
- [ ] T8.1 layout אדמין + ניווט + הגנת role
- [ ] T8.2 דשבורד: מדדי מפתח (מכירות/הזמנות/משתמשים)
- [ ] T8.3 CRUD מוצרים + ניהול מלאי
- [ ] T8.4 העלאת תמונות מוצר ל-R2
- [ ] T8.5 רשימת הזמנות + חיפוש/סינון
- [ ] T8.6 עדכון סטטוס הזמנה
- [ ] T8.7 CRUD קורסים/שיעורים
- [ ] T8.8 ניהול הרשמות לקורסים
- [ ] T8.9 ניהול גלריה/תוכן אתר
- [ ] T8.10 ניהול משתמשים והרשאות
- [ ] T8.11 בדיקות הרשאות אדמין (E2E)

---

## Phase 9 — חיבור לאפליקציית Restyle (קביעת תור)
> אין ניהול תורים באתר — קיימת אפליקציית Restyle. מפנים אליה.
- [ ] T9.1 `lib/config.ts` — קישורי האפליקציה (App Store / Google Play / web)
- [ ] T9.2 כפתור/CTA "קביעת תור" → אפליקציה (Hero + ניווט)
- [ ] T9.3 סקציית "הורד את האפליקציה" בדף הבית
- [ ] T9.4 badges של חנויות האפליקציות

---

## Phase 10 — הקשחה והשקה
- [ ] T10.1 Security headers (CSP/HSTS/X-Frame-Options) + CORS
- [ ] T10.2 Rate limiting (auth/טפסים/תשלום)
- [ ] T10.3 סקירת אבטחה מקיפה (/security-review)
- [ ] T10.4 מדיניות פרטיות + תנאי שימוש + באנר עוגיות
- [ ] T10.5 אופטימיזציית ביצועים (Lighthouse ≥90)
- [ ] T10.6 בדיקות נגישות מלאות
- [ ] T10.7 חבילת בדיקות E2E מלאה למסעות קריטיים
- [ ] T10.8 גיבויים + ניטור + לוגים (Supabase/Vercel)
- [ ] T10.9 הגדרת דומיין + DNS + SSL
- [ ] T10.10 Production deploy + smoke test
