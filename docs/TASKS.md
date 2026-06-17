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

## Phase 1 — Scaffolding ותשתית קוד
### 1A. אתחול
- [ ] T1.1 `create-next-app` (App Router, TS, src/, ESLint)
- [ ] T1.2 הגדרת `tsconfig` strict + path aliases (`@/*`)
- [ ] T1.3 התקנת Tailwind + הגדרת `tailwind.config` + `globals.css`
- [ ] T1.4 התקנת shadcn/ui + theme ראשוני
- [ ] T1.5 Prettier + ESLint rules + `.editorconfig`
- [ ] T1.6 הגדרת scripts: `dev/build/lint/typecheck/test`

### 1B. RTL ועברית
- [ ] T1.7 `<html dir="rtl" lang="he">` ב-root layout
- [ ] T1.8 חיבור פונט עברי (Heebo/Assistant) דרך `next/font`
- [ ] T1.9 הגדרות Tailwind ל-RTL (logical properties)

### 1C. תשתיות
- [ ] T1.10 `lib/env.ts` — אימות משתני סביבה ב-zod
- [ ] T1.11 `.env.example` + תיעוד משתנים
- [ ] T1.12 התקנת Prisma + `schema.prisma` ריק + חיבור Supabase
- [ ] T1.13 `lib/db.ts` — Prisma client singleton
- [ ] T1.14 migration ראשונה + בדיקת חיבור DB
- [ ] T1.15 הגדרת Vitest + בדיקת sanity
- [ ] T1.16 הגדרת Playwright + בדיקת sanity

### 1D. עיצוב בסיס + CI
- [ ] T1.17 ערכת עיצוב (צבעים/טיפוגרפיה/spacing) — design tokens
- [ ] T1.18 Header + ניווט רספונסיבי
- [ ] T1.19 Footer
- [ ] T1.20 קומפוננטות UI בסיס (Button/Input/Card/Container)
- [ ] T1.21 דף בית placeholder
- [ ] T1.22 חיבור פרויקט ל-Vercel + preview deploy
- [ ] T1.23 GitHub Actions: lint + typecheck + test על PR

---

## Phase 2 — אתר תדמית (Marketing)
- [ ] T2.1 layout משותף ל-marketing
- [ ] T2.2 Hero section (תמונה גדולה + CTA) — סגנון menspire
- [ ] T2.3 סקציית שירותים בדף הבית
- [ ] T2.4 סקציית "אודות" תקציר
- [ ] T2.5 סקציית גלריה/לפני-אחרי
- [ ] T2.6 סקציית המלצות/לקוחות
- [ ] T2.7 סקציית CTA + מיקום/שעות
- [ ] T2.8 עמוד אודות מלא
- [ ] T2.9 עמוד שירותים מלא
- [ ] T2.10 עמוד גלריה
- [ ] T2.11 עמוד צור קשר + טופס (zod + הגנת ספאם)
- [ ] T2.12 server action לשליחת טופס צור קשר (Resend)
- [ ] T2.13 SEO: metadata לכל עמוד + OG images
- [ ] T2.14 sitemap.xml + robots.txt
- [ ] T2.15 בדיקת נגישות + Lighthouse לעמודים

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
- [ ] T6.7 מייל אישור הזמנה (Resend)
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

## Phase 9 — תורים/הזמנת שירות (עתידי)
- [ ] T9.1 מודל Service + Appointment + זמינות
- [ ] T9.2 לוח זמינות/יומן
- [ ] T9.3 זרימת קביעת תור online
- [ ] T9.4 ניהול תורים באדמין
- [ ] T9.5 תזכורות מייל/SMS (אופציונלי)

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
