# תכנון — Phase 3: Supabase Auth ואזור אישי בסיסי

## 1. ערך למשתמש
- **לקוח/ה:** יכולים להירשם/להתחבר כדי לראות (בעתיד) היסטוריית הזמנות, קורסים שנרכשו.
  בשלב זה (Phase 3) — מסך "אזור אישי" בסיסי שמציג פרטי פרופיל בלבד.
- **מנהל (admin):** תפקיד (`role`) מאפשר בעתיד הרשאות לדשבורד ניהול (Phase 8).

## 2. הקשר במערכת
לפי `docs/ARCHITECTURE.md`: Supabase Auth הוא ספק האימות הנבחר (email/password בשלב זה,
OTP/OAuth אפשריים בעתיד). הסיסמה לעולם לא נשמרת/מטופלת בקוד שלנו — מנוהלת כולה ע"י Supabase.
טבלת `users` (Prisma) מסונכרנת עם `auth.users` של Supabase: `id` משותף.

**מגבלת sandbox נוכחית:** Postgres TCP (Prisma) חסום, אך Supabase Auth עובד מעל HTTPS —
כך שניתן לפתח ולבדוק את כל זרימת ה-Auth בפועל מול הפרויקט האמיתי, רק כתיבות ישירות
ל-`users` דרך Prisma מהשרת המקומי לא ניתנות לבדיקה כאן (יעבדו ב-Vercel שיש לו גישת TCP).
לכן הסנכרון לטבלת `users` ייעשה ב-**trigger ב-Postgres** (SQL, מופעל ב-Supabase SQL Editor —
כמו migration הראשונה), לא בקוד Next.js — כך שהוא לא תלוי בגישת TCP מה-sandbox ועובד אוטומטית
בכל סביבה.

## 3. מודל נתונים
טבלת `users` הקיימת (`prisma/schema.prisma`) מספיקה לשלב זה — אין צורך בשינוי סכמה:
```prisma
model User {
  id        String   @id          // = auth.users.id
  email     String   @unique
  name      String?
  phone     String?
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```
**SQL נוסף שיורץ ב-Supabase SQL Editor** (כקובץ `prisma/migrations/.../migration.sql` חדש,
ל-history, גם אם מורץ ידנית כמו הקודם):
- Trigger function `handle_new_user()` שמופעל `AFTER INSERT ON auth.users` ומכניס שורה
  תואמת ל-`public.users` (id, email, name מ-`raw_user_meta_data->>'name'`, role='USER').
- RLS על `public.users`: בעלים יכול `SELECT/UPDATE` רק את השורה שלו; אין מדיניות מחיקה.
  (admin policies יתווספו ב-Phase 8 עם service-role bypass בצד שרת בלבד).

## 4. חוזה API / Server Actions
כל הפעולות ב-`src/server/actions/auth.ts`, קלט מאומת ב-zod:

| Action | קלט | פלט | הערות |
|---|---|---|---|
| `signUp` | email, password, name | `{ ok, error? }` | Supabase `auth.signUp`; דורש אימות מייל (ברירת מחדל Supabase) |
| `signIn` | email, password | `{ ok, error? }` | Supabase `auth.signInWithPassword`; קובע session cookie |
| `signOut` | — | `{ ok }` | מנקה session |
| `requestPasswordReset` | email | `{ ok }` (תמיד הצלחה — לא לחשוף אם המייל קיים) | Supabase `auth.resetPasswordForEmail` |
| `updatePassword` | password חדש | `{ ok, error? }` | רק בתוך session תקף (מגיע מקישור איפוס) |

Route handler נוסף: `src/app/auth/callback/route.ts` — מחליף `code` מקישור המייל ב-session
(`exchangeCodeForSession`), לפי תבנית `@supabase/ssr` הרשמית.

## 5. UI/UX (מובייל-first, RTL, השראת menspire — נקי ומינימליסטי)
- `/login` — טופס אימייל+סיסמה, קישור ל-"שכחת סיסמה" ול-"הרשמה".
- `/register` — טופס אימייל+סיסמה+שם, אחרי שליחה: הודעה "נשלח מייל אימות".
- `/forgot-password` — טופס אימייל בלבד.
- `/reset-password` — טופס סיסמה חדשה (מגיע מקישור המייל דרך `/auth/callback`).
- `/account` — מוגן ע"י middleware; מציג שם/אימייל + כפתור התנתקות. (בסיסי לשלב זה.)
- כל הטפסים: `react-hook-form` + `zodResolver` (תבנית זהה לטופס צור קשר הקיים).

## 6. אבטחה (סקיל security יופעל לפני מעבר ל-QA)
- סיסמה: לעולם לא נשמרת/מטופלת בצד שלנו — מועברת ל-Supabase Auth API בלבד (HTTPS).
- `SUPABASE_SERVICE_ROLE_KEY` נשאר ב-server בלבד (כבר ב-`serverSchema` ב-`lib/env.ts`) —
  לא ייחשף לקליינט. ה-client-side משתמש רק ב-`NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- כל server action בודק session אמיתי (`supabase.auth.getUser()` בצד שרת) — **לעולם לא**
  סומך על userId שמגיע מהקליינט.
- Middleware מגן על `/account/**`: ללא session תקף → redirect ל-`/login`.
- RLS על `public.users` מבטיח הגנה גם אם יהיה bug בקוד השרת (defense-in-depth).
- שגיאות התחברות/איפוס: הודעה גנרית ("פרטים שגויים"/"אם הכתובת קיימת, נשלח מייל") —
  לא לחשוף אם מייל קיים במערכת (מניעת user enumeration).
- Rate limiting על signIn/signUp/reset — Supabase Auth כולל הגנה מובנית; לא דורש קוד נוסף בשלב זה.

## 7. קריטריוני קבלה (→ QA)
1. הרשמה עם מייל תקין יוצרת משתמש ב-Supabase Auth ושולחת מייל אימות.
2. ניסיון הרשמה עם מייל קיים: Supabase Auth מטפל בזה כברירת מחדל ע"י **אי-חשיפת** קיום
   המייל (anti-enumeration) — לרוב יוחזר "הצלחה" כדי לא לחשוף שהמייל רשום, ולא הודעת
   שגיאה ספציפית. ההודעה שלנו ("ייתכן שכבר רשום") היחידה שמוצגת היא לשגיאות אמיתיות אחרות.
3. התחברות עם פרטים נכונים מעבירה ל-`/account`; עם פרטים שגויים מציגה שגיאה גנרית.
4. גישה ל-`/account` ללא session מפנה אוטומטית ל-`/login`.
5. "שכחתי סיסמה" שולח מייל איפוס; קישור מוביל ל-`/reset-password` שמאפשר הגדרת סיסמה חדשה.
6. התנתקות מנקה את ה-session ומפנה לדף הבית.
7. `typecheck && lint && test && build` ירוקים.
8. כל הטקסט בעברית, RTL תקין בכל המסכים החדשים.

## 8. פירוק למשימות (Development)
1. התקנת `@supabase/supabase-js` + `@supabase/ssr`.
2. `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`, `src/lib/supabase/middleware.ts`.
3. `middleware.ts` (root) — חידוש session + הגנת `/account`.
4. SQL migration: trigger + RLS (קובץ ב-`prisma/migrations/`, מורץ ידנית ב-SQL Editor כמו הקודם).
5. `src/lib/auth-schema.ts` (zod schemas) + `src/server/actions/auth.ts`.
6. עמודים: `/login`, `/register`, `/forgot-password`, `/reset-password`, `/account`.
7. `src/app/auth/callback/route.ts`.
8. עדכון `site-header.tsx` — קישור התחברות/אזור אישי.
9. בדיקות (vitest לוולידציה, ידני מול Supabase האמיתי ל-flow המלא).
10. הפעלת סקיל `security` לסקירה סופית.
11. עדכון `ROADMAP.md`.
