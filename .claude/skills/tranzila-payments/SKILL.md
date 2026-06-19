---
name: tranzila-payments
description: >-
  סקיל חיבור סליקת אשראי דרך טרנזילה (Tranzila) לפרויקט Restyle. Use this
  skill WHENEVER integrating, modifying, or reviewing Tranzila payment flows —
  hosted-fields/iframe checkout, callbacks/webhooks, refunds, PaymentProvider
  adapter, PCI scope, or anything in `lib/payments/`. רמת קריטיות: 10/10 —
  באג כאן יכול לעלות כסף אמיתי, לחשוף נתוני כרטיס, או להפיל את האתר.
  Triggers: "טרנזילה", "Tranzila", "סליקה", "תשלומים", "checkout",
  "PaymentProvider", "webhook תשלום", "callback סליקה".
---

# Skill: חיבור טרנזילה (Tranzila Payments)

מטרה: לחבר סליקת אשראי אמיתית בלי לאחסן פרטי כרטיס בשרת שלנו, בלי לאפשר
הונאה/הסלמת מחיר מהקליינט, ובלי לפספס אימות עסקה אמיתי לפני יצירת הזמנה.
**זה הקוד הקריטי ביותר באתר — אסור "כמעט עובד".** הפעל את סקיל `security`
על כל קוד בנושא הזה, גם אם הוא לא מוזכר במפורש.

## 0. לפני שמתחילים
- אישור תכנון מלא (`planning`) + קריטריוני קבלה לפני כתיבת קוד.
- צריך מהמשתמש: שם טרמינל (supplier) + סיסמת API (TranzilaPW) לסביבת **sandbox/test**
  של טרנזילה. **לעולם לא לבקש/לקבל את אלה בצ'אט בטקסט גלוי שיישמר בהיסטוריה אם אפשר
  להימנע** — להעדיף שהמשתמש יזין ישירות ל-`.env.local`/Vercel Env, לא בהודעה.
- כל הסודות עוברים דרך `lib/env.ts` (מאומת zod), אף פעם לא hardcoded ואף פעם לא ב-client bundle.

## 1. ארכיטקטורת אינטגרציה (להעדיף תמיד)
- **שיטת ברירת המחדל: iframe/Hosted Fields של טרנזילה** (`forms.tranzila.com` /
  TranzilaPay hosted page) — פרטי הכרטיס מוזנים בטופס שמוגש מ-Tranzila עצמה,
  **לא** עוברים בשרת שלנו ולא ב-JS שלנו. זה מצמצם דרמטית את scope ה-PCI (SAQ A
  במקום SAQ A-EP/D).
- **להימנע** מ-API ישיר שמעביר מספר כרטיס/CVV דרך השרת שלנו אלא אם המשתמש
  (בעל העסק) אישר במפורש שהוא לוקח על עצמו את עומס ה-PCI compliance הנדרש —
  במצב כזה לעצור ולשאול לפני שממשיכים.
- מימוש דרך ה-interface הקיים `PaymentProvider` (ראה `CLAUDE.md`/`docs/ARCHITECTURE.md`) —
  `lib/payments/tranzila.ts` הוא adapter יחיד, כל שאר הקוד (הזמנות, checkout UI)
  לא יודע שזו טרנזילה ספציפית. זה גם מה שמאפשר מעבר ל-HYP בעתיד בלי לשנות לוגיקה עסקית.

## 2. זרימת עסקה — סדר חובה
1. **שרת** יוצר הזמנה (status=`pending`) ומחשב את הסכום **מה-DB בלבד** —
   לעולם לא לקחת סכום שמגיע מהקליינט/מה-URL/מ-query param ולהעביר אותו ישירות לסליקה.
2. **שרת** פותח עסקה מול טרנזילה (או מפנה ל-hosted page) עם סכום מאומת + מזהה הזמנה שלנו (`orderId`) כ-reference.
3. משתמש מזין כרטיס בטופס של טרנזילה (לא שלנו).
4. **callback/notify מטרנזילה → השרת שלנו**: זו נקודת האמת היחידה ליצירת/אישור תשלום.
   - **אסור** לסמוך על redirect בצד-לקוח ("חזרתי לעמוד הצלחה" ≠ שולם בפועל) — זה ניתן לזיוף בקלות (פשוט לגלוש ל-URL ההצלחה).
   - לאמת שהקריאה אכן הגיעה מטרנזילה: בדיקת חתימה/checksum אם הפרוטוקול מספק (TranzilaPay תומך ב-`feedback` עם פרמטרים חתומים) — **ואם לא בטוח**, לבצע קריאת אימות נוספת (server-to-server, "Inquire/Status" API) לפני שמסמנים הזמנה כ-paid.
   - **Idempotency**: callback כפול (טרנזילה יכולה לשלוח יותר מפעם אחת) לא יוצר חיוב/הזמנה כפולה — לבדוק לפי `orderId`+סטטוס לפני עדכון, ולהשתמש ב-unique constraint ב-DB כרשת ביטחון.
5. רק אחרי אימות בשרת — מעדכנים הזמנה ל-`paid`, שולחים אישור.

## 3. נתונים ואחסון
- **לא לאחסן** PAN/CVV/תוקף כרטיס בשום מקום בקוד/DB/לוגים שלנו — אפילו לא "רק לבדיקה".
- שומרים רק: `transactionId`/`confirmationCode` מטרנזילה, 4 ספרות אחרונות (אם בכלל נדרש להציג למשתמש), סטטוס.
- כספים ב-**integers (אגורות)** בכל ה-DB שלנו, כמו בכל הפרויקט — אבל טרנזילה מקבלת/מחזירה סכום בשקלים עם נקודה עשרונית (₪) — **המרה חד-כיוונית מפורשת בנקודה אחת** (`lib/payments/tranzila.ts`), עם בדיקת yunit/עיגול כדי שלא ייווצר פער של אגורה.
- לוגים: לעולם לא ללוג body מלא של בקשת תשלום (יכול להכיל רמזי כרטיס/פרטי לקוח) — ללוג רק `orderId`+סטטוס+timestamp.

## 4. סביבות
- לפתח ולבדוק תמיד מול **טרמינל test/sandbox** של טרנזילה לפני מעבר לטרמינל live.
- משתני סביבה נפרדים ל-test/production (`TRANZILA_TERMINAL`, `TRANZILA_TERMINAL_PASSWORD` או דומה) — לא להשתמש בטרמינל live בסביבת dev/preview בטעות. לבדוק ב-`lib/env.ts` שיש separation ברור, ואם אפשר — safety check שמונע terminal live כש-`NODE_ENV !== "production"`.
- Webhook/notify URL חייב URL ציבורי קבוע (production domain) — לתעד את ההגבלה הזו אם נבדק לפני שיש דומיין.

## 5. Checklist אבטחה ספציפי (להריץ לפני "סיימתי")
- [ ] פרטי כרטיס לא עוברים אף פעם בשרת/בקליינט שלנו (iframe בלבד).
- [ ] סכום החיוב מחושב בשרת מה-DB, לא מתקבל מהקליינט.
- [ ] callback מאומת (חתימה/checksum או קריאת status נוספת) לפני שמסמנים תשלום כהצליח.
- [ ] callback אידמפוטנטי (constraint ב-DB + בדיקת סטטוס קיים).
- [ ] אין PAN/CVV בלוגים, DB, או הודעות שגיאה שמוחזרות ללקוח.
- [ ] סודות טרנזילה רק ב-ENV מאומת (`lib/env.ts`), לא ב-git, לא ב-client bundle.
- [ ] rate limiting על נקודות הקצה הקשורות לתשלום (כמו שיש כבר לטפסי auth/contact).
- [ ] בדיקת הרשאה — משתמש לא יכול לשלם/לראות הזמנה שאינה שלו (IDOR).
- [ ] בדיקת עסקה כפולה/race condition (לחיצה כפולה על "שלם").
- [ ] בוצע סבב pentest ייעודי (סקיל `security`) על כל הקוד הזה לפני production, לא רק code review רגיל.

## 6. תהליך עבודה מומלץ
1. `planning` — לתעד את הזרימה המדויקת (דיאגרמת רצף: הזמנה→hosted page→callback→אימות→עדכון) ב-`docs/features/` לפני קוד.
2. `development` — מימוש `lib/payments/tranzila.ts` לפי ה-interface, route handler ל-callback ב-`src/app/api/`.
3. בדיקה מול sandbox טרנזילה: עסקה מוצלחת, עסקה נכשלת, callback כפול, callback מזויף (לדמות תוקף).
4. `security` — סבב pentest ייעודי, לא רק checklist.
5. `qa` — E2E עם Playwright (לפחות mock של flow ה-hosted page, אם אי אפשר לבדוק כרטיס אמיתי).
6. תיעוד ב-`docs/ARCHITECTURE.md` (סעיף תשלומים) + עדכון `ROADMAP.md`.

## 7. אם נתקעים
המשתמש חיבר טרנזילה בעצמו מספר פעמים בעבר עם Claude בהצלחה יחסית — אם יש
ספק/תקיעות בפרטי API ספציפיים (פורמט פרמטרים, קודי שגיאה, גרסת API), **לשאול
את המשתמש** לפני ניחוש, הוא יכול לעזור ישירות מהידע הקודם שלו.
