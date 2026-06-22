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

## 1. שלושת מסלולי האינטגרציה הרשמיים של טרנזילה (לפי `docs.tranzila.com`)
טרנזילה עצמה מגדירה שלוש שיטות אינטגרציה, עם scope PCI עולה:
1. **Iframe Integration** (handshake-based) — PCI מינימלי (**SAQ-A**). פרטי הכרטיס
   מוזנים בטופס שטרנזילה מגישה בתוך iframe; השרת שלנו רק מבקש "handshake token"
   ופותח את ה-iframe עם הטוקן. **זו ברירת המחדל המומלצת.**
2. **Hosted Fields** — PCI נמוך (**SAQ-A-EP**), checkout מותאם יותר ויזואלית אבל
   scope PCI גבוה יותר מ-iframe מלא. להעדיף iframe על פני זה אלא אם יש דרישת UX מפורשת.
3. **API V2** (server-to-server) — **SAQ-D**, מספר הכרטיס/CVV עוברים בפועל בשרת שלנו.
   **להימנע לחלוטין** אלא אם המשתמש (בעל העסק) מאשר במפורש שהוא לוקח על עצמו את מלא
   האחריות/עומס ה-PCI compliance הנדרש (ביקורות, סקרי אבטחה תקופתיים) — לעצור ולשאול
   לפני שממשיכים בכיוון הזה.

לפי תיעוד טרנזילה: **"redirect functionality has been removed in favor of the
handshake-based iframe integration for better PCI compliance"** — כלומר טרנזילה
עצמה זנחה את שיטת ה-redirect הישנה לטובת ה-handshake/iframe. זה מאשש שה-iframe
הוא הכיוון המודרני והמועדף מבחינתם, לא רק בחירה שלנו.

- **אימותים**: ל-iframe/handshake נדרשים **שם טרמינל + סיסמת API (TranzilaPW)**.
  ל-API V2 נדרשים **app key + secret + terminal name** (header כדוגמת
  `X-tranzila-api-app-key`), עם חתימת HMAC-SHA256 על app key+secret+timestamp+nonce
  בבקשות מאומתות. **ה-API הספציפי, שמות הפרמטרים והפורמט המדויק יכולים להשתנות —
  יש לאמת מול `docs.tranzila.com` בזמן המימוש בפועל, לא להעתיק כלשונו ממסמך זה.**
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
   - תשובות API של טרנזילה (גם handshake וגם תוצאת עסקה) חוזרות בד"כ עם שדה
     `error_code`/`Response` — **`error_code:0` = הצלחה**, כל ערך אחר = כשלון; לבדוק
     את זה במפורש, לא רק "אם הגיעה תשובה".
   - **לא ידוע בוודאות בזמן כתיבת הסקיל הזה אם/איך נשלחת חתימה קריפטוגרפית על
     callback ל-notify URL** (לא אומת במחקר). **חובה לאמת זאת מול
     `docs.tranzila.com` בפועל לפני המימוש.** עד שזה מאומת — לא להסתפק בקבלת
     callback בלבד: לבצע **קריאת אימות נוספת server-to-server** ("Inquire"/בדיקת
     סטטוס עסקה לפי `orderId`/transaction reference מול ה-API) לפני שמסמנים הזמנה
     כ-paid. זו רשת ביטחון שלא תלויה בשאלת החתימה.
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

## 7. אם נתקעים / מקורות
- **תיעוד רשמי**: `https://docs.tranzila.com/` (Payments & Billing → Iframe
  Integration, API V2). **חובה לקרוא את הדפים הרלוונטיים בפועל בזמן המימוש** —
  הסקיל הזה מבוסס על מחקר אינטרנט חלקי (תוצאות חיפוש + ספריית Omnipay של צד ג',
  לא הדפים המלאים של טרנזילה עצמם, שלא היו נגישים ל-fetch ישיר בזמן הכתיבה).
  כל פרט קונקרטי (שמות פרמטרים, מבנה חתימה, endpoints מדויקים) **לאמת מול
  התיעוד הרשמי**, לא להעתיק מהסקיל הזה כלשונו.
- אין למשתמש ניסיון אישי קודם בחיבור טרנזילה — אם משהו לא ברור, **לחפש
  באינטרנט מחדש בזמן המימוש** ולהציג למשתמש את המקור (קישור) לפני שמניחים הנחה
  קריטית לאבטחה, במיוחד בנושא אימות callback/חתימה.
