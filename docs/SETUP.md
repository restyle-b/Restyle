# SETUP — מה צריך ממך (הקמת חשבונות ומפתחות)

מדריך מלא לכל מה ש**אתה** צריך להקים מהצד שלך. סדר מומלץ: לפי השלבים.
כל מפתח שתפיק — שלח לי או הזן ל-`.env.local` (ולעולם לא לדחוף ל-git!).

מקרא: 🔴 חובה ל-Phase 1 · 🟡 נדרש בהמשך · 🟢 עתידי

---

## 1. 🔴 GitHub (כבר קיים)
הריפו מחובר. צריך רק לאשר לי לפתוח `main` כבסיס ל-PR-ים בעתיד.

---

## 2. 🔴 Vercel (אירוח האתר)
1. צור חשבון ב-https://vercel.com (התחברות עם GitHub).
2. **Import Project** → בחר את הריפו `restyle-b/Restyle`.
3. אין צורך להגדיר build — Vercel מזהה Next.js אוטומטית.
4. בהמשך נזין את משתני הסביבה ב-Settings → Environment Variables (אני אנחה).
5. **מה אני צריך ממך:** רק שתחבר את הריפו ל-Vercel. את ה-tokens אני לא צריך — Vercel מתחבר ל-GitHub לבד.

> חינמי (Hobby) לפיתוח; שדרוג ל-Pro (~$20/חודש) כשעולים לפרודקשן עם דומיין.

---

## 3. 🔴 Supabase (דאטהבייס + Auth)
1. צור חשבון ב-https://supabase.com.
2. **New Project** → שם: `restyle` → **Region: Frankfurt (eu-central-1)** (קרוב לישראל).
3. בחר סיסמת DB חזקה ושמור אותה.
4. אחרי יצירה, לך ל-**Settings → API** והעתק:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` (🔒 סודי!) → `SUPABASE_SERVICE_ROLE_KEY`
5. **Settings → Database → Connection string (URI)** → `DATABASE_URL` (ל-Prisma).

> חינמי לפיתוח; Pro (~$25/חודש) כשצריך גיבויים/ביצועים בפרודקשן.

---

## 4. 🔴 Cloudflare R2 (אחסון תמונות)
1. צור חשבון ב-https://cloudflare.com.
2. בתפריט הצד → **R2** → הפעל (דורש כרטיס אשראי, אך יש tier חינמי נדיב).
3. **Create bucket** → שם: `restyle-media`.
4. **Manage R2 API Tokens → Create API Token** (הרשאת Read & Write) והעתק:
   - `Access Key ID` → `R2_ACCESS_KEY_ID`
   - `Secret Access Key` (🔒) → `R2_SECRET_ACCESS_KEY`
   - `Account ID` → `R2_ACCOUNT_ID` (נמצא בעמוד R2)
   - שם ה-bucket → `R2_BUCKET=restyle-media`
5. (בהמשך) חיבור דומיין ציבורי ל-bucket לצורך CDN — אנחה כשנגיע.

> R2 ללא דמי egress — יתרון גדול לאתר עתיר תמונות.

---

## 5. 🟡 Brevo (שליחת מיילים)
נדרש מ-Phase 2 (טופס צור קשר) ו-Phase 6 (אישורי הזמנה).
1. צור חשבון ב-https://www.brevo.com.
2. **SMTP & API → API Keys → Generate a new API key** → `BREVO_API_KEY` (🔒).
3. (פרודקשן) אימות דומיין שליחה (SPF/DKIM, Senders, Domains & Dedicated IPs) —
   אז `BREVO_SENDER_EMAIL` יכול להיות כתובת בדומיין האמיתי (לדוגמה
   `noreply@restyle.co.il`); בלעדיו Brevo עלול לחסום/לסמן כספאם.
4. תוכנית חינמית: 300 מיילים ביום (~9,000/חודש) — ראה השוואת ספקים
   ב-Session Log של `ROADMAP.md` (2026-06-23).

---

## 6. 🟡 דומיין
כשנגיע לפרודקשן (Phase 10):
1. רכוש דומיין (Cloudflare Registrar / GoDaddy / וכו').
2. נחבר ל-Vercel (רשומות DNS) — אנחה צעד-צעד.
3. **מה אני צריך ממך:** שם הדומיין הרצוי + גישה ל-DNS.

---

## 7. 🟢 תשלומים — Tranzila / HYP (עתידי)
לא נדרש עד שנחבר תשלום אמיתי (אחרי Phase 5). כשתחליט:
1. פתח חשבון סולק/ספק (Tranzila או HYP) — דורש עוסק/חברה ואישור.
2. תקבל: Terminal/Supplier ID, מפתח API, וסוד ל-webhook.
3. נזין כ-`PAYMENT_PROVIDER`, `PAYMENT_API_KEY` (🔒), `PAYMENT_WEBHOOK_SECRET` (🔒).
> עד אז נעבוד עם `MockProvider` — האתר מתפקד מלא בלי תשלום אמיתי.

---

## סיכום משתני סביבה (`.env.local`)
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # 🔒
DATABASE_URL=                     # 🔒

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=             # 🔒
R2_BUCKET=restyle-media

# Brevo (Phase 2+)
BREVO_API_KEY=                    # 🔒
BREVO_SENDER_EMAIL=
CONTACT_NOTIFICATION_EMAIL=

# Payments (עתידי)
PAYMENT_PROVIDER=mock
PAYMENT_API_KEY=                  # 🔒
PAYMENT_WEBHOOK_SECRET=           # 🔒
```

> 🔒 = סוד. לעולם לא לדחוף ל-git (יהיה ב-`.gitignore`). בפרודקשן מזינים ב-Vercel Env Vars.

---

## מה חוסם את Phase 1 (המינימום להתחלה)
כדי שאוכל להתחיל לפתח בפועל, אני צריך ממך:
1. ✅ חיבור הריפו ל-**Vercel**.
2. ✅ פרויקט **Supabase** + 4 המפתחות (URL, anon, service_role, DATABASE_URL).
3. ✅ bucket + tokens של **Cloudflare R2**.

את Resend/דומיין/תשלומים אפשר להשלים בהמשך. עד שתספק את אלה — אוכל להמשיך
בכל עבודת ה-scaffolding והקוד שאינה דורשת חיבור חי.
