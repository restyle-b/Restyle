---
name: development
description: >-
  סקיל פיתוח לפרויקט Restyle — תקני קוד, מבנה, וזרימת עבודה ל-Next.js 15 +
  TypeScript + Tailwind + Prisma/Supabase. Use this skill WHEN writing or
  modifying application code: components, pages, server actions, API routes,
  database models, styling. Triggers: "בוא נפתח", "תכתוב", "תממש", "implement",
  "build the component", "add endpoint", "write the code".
---

# Skill: פיתוח (Development)

מטרה: לכתוב קוד עקבי, מאובטח ותחזוקתי לפי הסטאק והקונבנציות של Restyle.
פתח רק אחרי שהתכנון (`planning`) ברור.

## הסטאק
- **Framework:** Next.js 15 (App Router) + React 19 + TypeScript (strict).
- **עיצוב:** Tailwind CSS + shadcn/ui (Radix). RTL כברירת מחדל.
- **DB/ORM:** PostgreSQL (Supabase) + Prisma.
- **Auth:** Supabase Auth (אימייל/OTP + OAuth בעתיד).
- **אחסון קבצים:** Cloudflare R2 (S3-compatible) דרך presigned URLs.
- **תשלומים:** שכבת הפשטה `PaymentProvider` (Tranzila/HYP בעתיד).
- **טפסים/ולידציה:** react-hook-form + zod (אותו schema בשרת ובקליינט).
- **דאטה בקליינט:** TanStack Query (כשצריך). העדף Server Components.
- **אימייל:** Resend.
- **בדיקות:** Vitest (יחידה), Playwright (E2E).

## מבנה תיקיות (יעד)
```
src/
  app/
    (marketing)/        # דף בית, אודות, שירותים, גלריה, צור קשר
    (shop)/             # חנות, מוצר, עגלה, צ'קאאוט
    (academy)/          # אקדמיה, קורסים, הרשמה
    (account)/          # אזור אישי: הזמנות, קורסים, פרופיל
    admin/              # ממשק ניהול
    api/                # route handlers (webhooks, payments callbacks)
  components/ui/        # shadcn primitives
  components/           # קומפוננטות משותפות
  lib/                  # db, auth, storage, payments, utils
  lib/payments/         # PaymentProvider interface + adapters
  server/actions/       # Server Actions לפי דומיין
prisma/schema.prisma
```

## כללי קוד
- **TypeScript strict** — אסור `any`. השתמש ב-zod ל-runtime validation על כל קלט חיצוני.
- **Server Actions** לכל מוטציה; ולידציה עם zod בתחילת כל action; בדיקת הרשאות תמיד.
- **אסור לחשוף סודות לקליינט** — מפתחות רק ב-server. ENV דרך `lib/env.ts` מאומת ב-zod.
- **כל גישת DB עם בדיקת בעלות/הרשאה** — לעולם לא לסמוך על ID שמגיע מהקליינט בלי אימות שהמשתמש מורשה.
- **כספים ב-integers (אגורות)** — לעולם לא float לכסף.
- **next/image** לכל התמונות + lazy loading. תמונות מ-R2/CDN.
- **קומפוננטות קטנות וממוקדות**; לוגיקה עסקית ב-`server/` או `lib/`, לא ב-JSX.
- **שמות באנגלית בקוד**, טקסטים למשתמש בעברית (מרוכז ל-i18n כשנגיע לזה).

## זרימת עבודה
1. ודא שיש תכנון וקריטריוני קבלה (`planning`).
2. אם נדרש שינוי סכמה: עדכן `prisma/schema.prisma` → `prisma migrate`.
3. כתוב server action / route + ולידציה + הרשאות.
4. כתוב UI (RTL, נגיש, רספונסיבי).
5. הרץ lint + typecheck + בדיקות.
6. הפעל `security` על קוד שנוגע בנתוני משתמש/תשלום/הרשאות.
7. מסור ל-`qa` מול קריטריוני הקבלה.
8. עדכן `ROADMAP.md`.

## איכות לפני commit
`npm run lint && npm run typecheck && npm test` חייבים לעבור. אל תכתוב "סיימתי" בלי שהריצה ירוקה.
