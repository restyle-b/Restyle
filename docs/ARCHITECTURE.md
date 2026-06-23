# ארכיטקטורה — Restyle

מסמך התכנון הטכני המלא. מעודכן בכל החלטה ארכיטקטונית משמעותית.

---

## 1. סקירה כללית
פלטפורמת מספרה פרימיום עם 5 מודולים: **Marketing, Shop, Academy, Account, Admin**,
נשענים על תשתית משותפת (Auth, DB, Storage, Payments). אפליקציית Next.js יחידה
(monolith מודולרי) — הכי מהיר לפיתוח ותחזוקה בשלב הזה, ניתן לפצל בעתיד.

```
                ┌─────────────── Next.js 15 (Vercel) ───────────────┐
   לקוח/נייד →  │  Marketing │ Shop │ Academy │ Account │ Admin       │
   (RTL, עברית) │  RSC + Server Actions + Route Handlers (API)       │
                └───┬──────────────┬──────────────┬─────────────────┘
                    │              │              │
              Supabase        Cloudflare R2   PaymentProvider
           (Postgres+Auth)    (תמונות/קבצים)  (Tranzila/HYP בעתיד)
                    │
                  Brevo (מיילים)
```

---

## 2. סטאק טכנולוגי ונימוקים

| תחום | בחירה | נימוק |
|------|-------|-------|
| Framework | **Next.js 15 (App Router)** | SSR/SSG ל-SEO ומהירות, RSC, Server Actions, API באותו פרויקט, תמיכת RTL מצוינת |
| שפה | **TypeScript (strict)** | בטיחות טיפוסים, פחות באגים, חוזים ברורים |
| עיצוב | **Tailwind + shadcn/ui** | מהיר, עקבי, נגיש (Radix), קל להגיע ל-look פרימיום כמו menspire |
| DB | **PostgreSQL (Supabase)** | רלציוני, אמין, RLS מובנה, מנוהל (פחות DevOps) |
| ORM | **Prisma** | type-safe, migrations, פרודוקטיביות |
| Auth | **Supabase Auth** | אימייל/OTP/OAuth, session מאובטח, אינטגרציה עם RLS |
| אחסון קבצים | **Cloudflare R2** | S3-compatible, **ללא דמי egress**, זול ל-CDN תמונות |
| תמונות | **next/image** + R2/CDN | אופטימיזציה אוטומטית, WebP, lazy load |
| תשלומים | **PaymentProvider interface** | הפשטה; חיבור Tranzila/HYP בעתיד בלי לשכתב |
| מיילים | **Brevo** | תוכנית חינמית נדיבה יותר (300/יום מ-100/יום ב-Resend), API פשוט |
| בדיקות | **Vitest + Playwright** | יחידה מהירה + E2E אמין |
| אירוח | **Vercel** | אינטגרציה native ל-Next.js, CDN גלובלי, SSL, preview deploys |

---

## 3. החלטת אירוח (תשובה ל"איפה לארח")

**המלצה: Vercel + Supabase + Cloudflare R2.**

- **האתר/השרת → Vercel:** edge CDN גלובלי (כולל ביצועים טובים לישראל), HTTPS אוטומטי,
  preview לכל PR, scaling אוטומטי. אין צורך בניהול שרת.
- **דאטהבייס → Supabase (Postgres מנוהל):** גיבויים, RLS, Auth מובנה, dashboard.
  אזור EU (פרנקפורט) — קרוב לישראל, תואם פרטיות.
- **תמונות/קבצים → Cloudflare R2:** S3-compatible **ללא דמי egress** (יתרון עצום
  לאתר עתיר תמונות), מוגש דרך CDN של Cloudflare. העלאות דרך presigned URLs.
- **מיילים → Brevo.** **תשלומים → Tranzila/HYP** (hosted, לא עוברים דרך השרת שלנו).

**עלות התחלתית:** נמוכה מאוד (רוב השירותים free/low tier) וגדלה לינארית עם התנועה.
**חלופות שנשקלו:** VPS (Hetzner) — זול אך דורש DevOps ידני; AWS — חזק אך מורכב/יקר
לשלב מוקדם. נבחר Vercel/Supabase לאיזון מיטבי בין מהירות פיתוח, עלות וסקייל.

---

## 4. מבנה הפרויקט
```
src/
  app/
    (marketing)/   shop/ (academy)/ (account)/ admin/   api/
  components/ui/   components/
  lib/            env.ts, db.ts, auth.ts, storage.ts
  lib/payments/   index.ts (PaymentProvider) + adapters/{mock,tranzila,hyp}
  server/actions/ shop/ orders/ academy/ account/ admin/
prisma/schema.prisma
docs/
.claude/skills/   planning/ development/ qa/ security/
```

---

## 5. מודל נתונים (טיוטה ראשונית — יורחב ב-planning לכל שלב)
- **User** — id, email, name, phone, role(user/admin), createdAt.
- **Product** — id, slug, name, description, priceAgorot, stock, images[], categoryId, active.
- **Category** — id, slug, name.
- **CartItem / Cart** — userId/sessionId, productId, qty.
- **Order** — id, userId, status, totalAgorot, shippingAddress, paymentRef, createdAt.
- **OrderItem** — orderId, productId, qty, unitPriceAgorot (snapshot).
- **Course** — id, slug, title, description, priceAgorot, images[], published.
- **Lesson** — id, courseId, title, content/videoRef, order.
- **Enrollment** — userId, courseId, status, purchasedAt.
- **Payment** — id, orderId/enrollmentId, provider, externalRef, amountAgorot, status.

> אין מודל תורים — קביעת תור מתבצעת באפליקציית Restyle הקיימת; האתר מפנה אליה בלבד.

> כסף תמיד ב-**אגורות (integer)**. כל טבלה עם נתוני משתמש מקבלת **RLS**.

### 5.1 Admin CMS — מודל נתונים (Phase 8, מומש 2026-06-23)
כל התוכן הציבורי היה סטטי (`messages/*.json` + `services-data.ts`/`academy-data.ts`/
`config.ts`) — הוחלף ב-CMS עם טבלאות תוכן חדשות. **עברית חובה בכל שדה
מתורגם, אנגלית/ערבית אופציונליים** (ריק → fallback לעברית בתצוגה הציבורית, ע"י
helper `pick(locale, he, en, ar)` החזרי ב-`get-*.ts`).
ממשק ה-Admin עצמו (`src/app/admin/*`) בעברית קבועה, **מחוץ** לניתוב `[locale]`.

```prisma
model SiteSettings { id Int @id @default(1)  phone String  email String  address String
  whatsapp String  instagramUrl String?  facebookUrl String?  appStoreUrl String?
  googlePlayUrl String?  updatedAt DateTime @updatedAt  updatedById String? }

model OpeningHour { id Int @id @default(autoincrement())  dayOrder Int @unique
  dayHe String  dayEn String?  dayAr String?  hoursHe String  hoursEn String?  hoursAr String? }

model Service { id String @id @default(cuid())  slug String @unique  order Int @default(0)
  nameHe String  nameEn String?  nameAr String?  descriptionHe String  descriptionEn String?
  descriptionAr String?  active Boolean @default(true)  createdAt/updatedAt DateTime }

model Course { /* כמו Service + durationHe/En/Ar, levelHe/En/Ar */ }

model Testimonial { id String @id @default(cuid())  order Int @default(0)
  nameHe/En/Ar String  quoteHe/En/Ar String  active Boolean @default(true) }

model GalleryImage { id String @id @default(cuid())  order Int @default(0)
  imageUrl String  altHe/En/Ar String  active Boolean @default(true) }

// טקסטי שיווק/משפטי — key-value גמיש (namespace/key תואם ל-messages/he.json
// הקיים), כדי שמיגרציית seed תהיה ישירה ובלי 100+ עמודות קשיחות.
model ContentBlock { id String @id @default(cuid())  namespace String  key String
  valueHe String @db.Text  valueEn String? @db.Text  valueAr String? @db.Text
  updatedAt DateTime @updatedAt  updatedById String?  @@unique([namespace, key]) }
```

**סטיה מהתכנון המקורי — `imageUrl` במקום `imageKey`:** R2 (presigned upload)
עדיין לא חובר בפועל. עד שיחובר, `GalleryImage.imageUrl` הוא URL מלא שמוזן
ידנית ב-Admin (מאומת http/https-בלבד ע"י zod). מוצג ב-`<img>` רגיל (לא
`next/image`) כי `next.config.ts` משאיר `remotePatterns: []` למניעת SSRF —
ברגע ש-R2 יחובר, יש להחליף לשדה `imageKey` + presigned URL + `next/image` עם
`remotePatterns` מצומצם לדומיין ה-bucket בלבד.

**מנגנון מיזוג טקסטים (`ContentBlock`) — `src/i18n/request.ts`:** זו נקודת
ה-bottleneck היחידה. `getRequestConfig` קורא את ה-JSON הסטטי
(`messages/<locale>.json`), ואז קורא `getContentOverrides()` (קאש עם תג
`content-blocks`, `unstable_cache`) ומבצע `mergeContentOverrides` (deep-merge
לפי `namespace.key` עם fallback לעברית כשאין En/Ar). כך **כל** קריאות
`t()`/`useTranslations()` הקיימות באתר משקפות אוטומטית עריכות מה-Admin בלי
לשנות אף קומפוננטה ציבורית. דפים שעברו ל-DB-backed תוכן דינמי (שירותים,
אקדמיה, גלריה, המלצות) עברו בנפרד ל-Server Component `async` עם
`getTranslations` מ-`next-intl/server` (לא `useTranslations` — hook קליינט
שלא ניתן להריץ בתוך async component).

**שכבת קריאה ציבורית (`src/lib/content/get-*.ts`):** קובץ נפרד לכל ישות
(`get-services.ts`/`get-courses.ts`/`get-testimonials.ts`/`get-gallery.ts`),
כל אחד מייצא תג קאש (`SERVICES_TAG` וכו') ופונקציית `get*(locale)`: קוראת
מה-DB דרך Prisma תחת `unstable_cache`, ואם אין שורות (DB לא זמין/לפני
מיגרציה/טבלה ריקה) — **falls back** לדאטה הסטטי הקיים (`services-data.ts`
וכו'), per ההחלטה הארכיטקטונית שבסיס 5.1.

**RLS:** קריאה פתוחה (`anon` select — תוכן ציבורי), כתיבה רק ל-`ADMIN` — נבדק
**גם** ב-RLS וגם ב-server action (defense in depth, כמו בשאר המערכת).

**`requireAdmin()`** (`lib/auth/require-admin.ts`) — בודק session דרך
Supabase + `role==='ADMIN'` ב-Prisma; **fail closed**. נקרא בתחילת כל admin
server action (`src/server/actions/admin/*.ts`), **בנוסף** לחסימת `/admin/*`
ב-`middleware.ts` (לא להסתמך על שכבה אחת). כל action מבצע `revalidateTag` +
`revalidatePath` per-locale אחרי כתיבה.

**תתי-שלבים שמומשו:** 8.1 תשתית+SiteSettings → 8.2 שירותים+קורסים → 8.3
המלצות+גלריה (URL ישיר, ללא R2 עדיין) → 8.4 `ContentBlock` (seed מ-JSON,
מיגרציה ידנית טרם הורצה ב-Supabase). נותר: 8.5 ניהול משתמשים/הרשאות (security
סקיל ייעודי), חיבור R2 בפועל. פירוט מלא ב-`ROADMAP.md` Phase 8.

---

## 6. תשתית תשלומים (Tranzila / HYP בעתיד)
שכבת הפשטה כדי שלא נהיה כבולים לספק:

```ts
interface PaymentProvider {
  createCheckout(input: CheckoutInput): Promise<{ redirectUrl: string; ref: string }>;
  verifyCallback(req: Request): Promise<PaymentResult>; // אימות חתימה/HMAC
  refund(ref: string, amountAgorot: number): Promise<RefundResult>;
}
```
- מתאמים: `MockProvider` (פיתוח/בדיקות) → `TranzilaProvider` / `HypProvider` (עתיד).
- **לא מאחסנים פרטי כרטיס** — redirect/hosted fields אצל הספק; שומרים רק `externalRef`.
- **סכום מחושב בשרת** מה-DB; callback מאומת חתימה; **idempotency** למניעת חיוב כפול.

---

## 7. אבטחה (תקציר — פירוט ב-`.claude/skills/security`)
- RLS ב-Supabase + בדיקת הרשאה בכל server action (defense in depth).
- מניעת IDOR — בדיקת בעלות על כל משאב.
- ENV מאומת ב-`lib/env.ts`; סודות בשרת בלבד.
- Security headers (CSP/HSTS/X-Frame-Options), rate limiting להתחברות.
- ולידציית zod על כל קלט; Prisma פרמטרי (אנטי-injection); סניטציית XSS.
- תאימות פרטיות (חוק הגנת הפרטיות הישראלי): מדיניות פרטיות, מינימיזציה, זכות מחיקה.

### 7.0 ⚠️ RLS מול Prisma — מגבלה ארכיטקטונית קריטית לדעת (תועד 2026-06-23)
**`DATABASE_URL` (Prisma) מתחבר כ-role `postgres.<project-ref>` (Supabase pooler), שעוקף RLS
לחלוטין.** RLS חל רק על חיבורים שעוברים דרך PostgREST עם JWT אמיתי (`anon`/`authenticated`) —
לא על חיבור Postgres ישיר. המשמעות:
- כל ה-policies שמוגדרים במיגרציות (services/courses/testimonials/gallery_images/content_blocks/
  users) הם **הגנת-עומק תיאורטית** למקרה עתידי של קריאה ישירה מ-client (`supabase-js` מהדפדפן) —
  **אין כיום קוד כזה**, אז ה-policies לא ההגנה הפעילה בפועל.
- **ההגנה האקטיבית האמיתית על כל גישה דרך `db` (Prisma) היא בדיקת ההרשאה בקוד עצמו**
  (`requireAdmin()`, `supabase.auth.getUser()`) — לא RLS. אל תניחו ש-RLS "מכסה" קוד שמשתמש ב-`db`.
- **באג שקט קשור (כיום לא רלוונטי בפועל)**: trigger `prevent_role_change` (§7.1) בודק
  `current_setting('request.jwt.claims', true)` — GUC שמוזרק רק ע"י PostgREST, **לא קיים בחיבור
  Prisma**. לכן כל `db.user.update({data:{role:...}})` דרך קוד **ייכשל בשקט בלי שגיאה** — ה-trigger
  "חושב" שזה לא `service_role` ומאפס את ה-role לערך הישן. `scripts/promote-business-admin.sql`
  כבר עוקף את זה בכוונה (`ALTER TABLE ... DISABLE/ENABLE TRIGGER` בתוך טרנזקציה). **Phase 8.5
  (ניהול הרשאות מה-Admin UI) בוטל לפי בקשת המשתמש (2026-06-23, ראה `ROADMAP.md`) — admin יחיד
  (העסק), מוענק ידנית בלבד דרך הסקריפט.** אם ההחלטה תתהפך בעתיד, יש לפתור את הבאג הזה לפני בניית
  UI לשינוי role.

### 7.1 ממצאי Pentest שטופלו (2026-06-18)
- **הסלמת הרשאות (HIGH):** ה-policy `users_update_own` איפשרה למשתמש לעדכן `role` לעצמו דרך
  PostgREST. נוסף trigger `prevent_role_change` (migration `20260618120000`) שמאפס שינוי `role`
  לכל מי שאינו `service_role`. ⚠️ דורש הרצה ידנית ב-Supabase SQL Editor.
- **Security headers (MED):** הוגדרו ב-`next.config.ts` — CSP, HSTS, X-Frame-Options: DENY,
  X-Content-Type-Options, Referrer-Policy, Permissions-Policy. הגופנים מוגשים עצמית (next/font).
- **Rate limiting (MED):** `lib/rate-limit.ts` (in-memory, best-effort) על טופס צור-קשר (5/דק'),
  signin (10/דק'), signup (5/דק'), reset (3/דק', שקט). לפרודקשן: לעבור ל-Vercel KV / Upstash.
- **לוג PII (MED):** טופס צור-קשר כבר לא רושם שם/מייל/טלפון/הודעה ללוג הפרודקשן (רק ב-dev).
- **Host header poisoning (MED):** `getOrigin` ב-auth מאמת host מול allowlist (דומיין פרודקשן /
  *.vercel.app / localhost) ונופל ל-`siteConfig.url`, למניעת הרעלת קישורי איפוס סיסמה.
- **Open-redirect backslash (LOW):** `safeRedirectPath` חוסם כעת גם `/\evil.com` (+בדיקה).

### 7.2 סבב Pentest שני — ממצאים שטופלו (2026-06-18)
- **עקיפת rate-limit דרך X-Forwarded-For (MED, רגרסיה בתיקון של 7.1):** `getClientIp`
  לקח את ה-entry השמאלי של `x-forwarded-for` שנשלט ע"י הלקוח → זיוף IP בכל בקשה עוקף
  את ה-rate-limit ומנפח את ה-Map. תוקן: עדיפות ל-`x-real-ip` (מוגדר ע"י Vercel, לא ניתן לזיוף).
- **Account enumeration (LOW):** הודעת שגיאת signUp רמזה על קיום אימייל → הוחלפה בגנרית.
- **Honeypot ללא הגבלת אורך (LOW):** `company` ב-signUp קיבל מחרוזת בכל גודל → הוגבל ל-256.
- **חוסר COOP (LOW):** נוסף `Cross-Origin-Opener-Policy: same-origin`.
- **robots.txt / sitemap.xml מחזירים 404 (BUG/SEO):** ה-matcher של ה-middleware תפס אותם
  ו-next-intl פירש כנתיב locale. תוקן ה-matcher (החרגת robots.txt/sitemap.xml + סיומות
  ico/txt/xml). אומת: שניהם 200, `/account` עדיין מוגן (307).

### 7.3 סבב Pentest שלישי (מעמיק) — 2026-06-18
- **DoS amplification ב-middleware (MED):** `supabase.auth.getUser()` רץ על כל בקשה תואמת,
  כולל תנועה אנונימית לעמודים ציבוריים — כל hit ייצר קריאת auth יוצאת ל-Supabase. הצפת
  האתר → הצפת Supabase Auth → מיצוי מכסה/חסימה (auth outage). תוקן: פונים ל-Supabase רק
  אם הנתיב מוגן או אם קיים cookie `sb-*` (משתמש מחובר). אומת: `/`=200 (מדלג), `/account`=307.
- **עקיפת allowlist ב-getOrigin (MED, פגם בתיקון 7.1#5):** `host.startsWith("localhost")`
  אישר גם `localhost.evil.com` → poisoning. תוקן להתאמה מדויקת (`localhost` / `localhost:`).
- **תלויות (npm audit):** HIGH (`vite`) ו-moderate (`postcss`) הם dev/build-time בלבד ולא
  חשופים בפרודקשן (vitest dev-server; postcss מעבד CSS פנימי מהימן). ⚠️ לא להריץ
  `npm audit fix --force` — הוא מוריד את Next ל-v9 (שובר). לעדכן בנקודת זמן עתידית.
- **נבדק ונקי:** אין סודות-שרת ב-bundle הקליינט; אין SSRF דרך `/_next/image`
  (URL חיצוני ו-169.254.169.254 → 400, `remotePatterns` ריק); React escaping על שם המשתמש
  המוצג ב-`/account` (אין stored XSS).

### 7.4 סבב Pentest רביעי — מבוסס מחקר CVE עדכני (2026-06-18)
מחקר באתרי Next.js/Vercel הרשמיים + OWASP. אומת מול הקוד והרצה בפועל:
- **גרסת Next מול כל ה-CVEs הידועים — מאומת מוגן:** אנו על **15.5.19** (העדכני ביותר בקו 15.5).
  - CVE-2025-29927 (middleware auth bypass דרך `x-middleware-subrequest`) — תוקן ב-15.2.3.
    **נבדק בפועל:** שליחת ה-header (כולל chained) ל-`/account` עדיין מחזירה 307 ✅.
  - CVE-2025-66478 "React2Shell" (RCE, CVSS 10.0) — תוקן ב-15.5.7.
  - CVE-2025-55183/55184/67779 (Source Code Exposure + DoS) — תוקן ב-15.5.9.
  - Next.js May 2026 release (13 advisories: middleware/proxy bypass, DoS, SSRF, cache
    poisoning, XSS, CVE-2026-23870) — תוקן ב-15.5.18. אנו על 15.5.19 → מכוסה.
  - ⚠️ הקו 15.5 הוא תחזוקה; ה-latest הוא 16.2.x. לתכנן הגירה ל-16.x להמשך תמיכת אבטחה.
- **X-Powered-By (LOW):** נחשף `Next.js` (fingerprinting) → בוטל ב-`poweredByHeader: false`.
- **נבדק ונקי:** אין source maps בפרודקשן (404); path traversal (גולמי+מקודד) → 404;
  long path (8k) → 404; TRACE → 500 גנרי בלי stack ללקוח; שיטות HTTP לא צפויות על `/account`
  → 307 (ההגנה חלה על כל ה-methods); אין X-Powered-By אחרי התיקון.

### 7.5 CSP בפיתוח מול פרודקשן (2026-06-18)
ב-QA חזותי עם Playwright התגלה ש-`npm run dev` נשבר תחת ה-CSP המחמיר: webpack
HMR עוטף מודולים ב-`eval()`, וה-CSP (`script-src 'self' 'unsafe-inline'` בלי
`unsafe-eval`) חסם את כל ה-JS בצד הלקוח מקומית. **תוקן** ב-`next.config.ts`:
`unsafe-eval` מתווסף ל-`script-src` רק כש-`NODE_ENV !== "production"`; ה-CSP
בפרודקשן (מאומת עם `next start`) ללא שינוי. זה תיקון DX בלבד — אינו מרחיב את
משטח התקיפה בפרודקשן.

### 7.6 סקירת אבטחה — תפריט מובייל מסך-מלא (2026-06-18)
לפני בניית התפריט הופעל סקיל security מראש (לא רק retrospect). ממצא: אין קלט
משתמש חדש, אין XSS (כל הטקסט מ-`next-intl`, לא מהמשתמש), קישורי `target=_blank`
כבר עם `rel="noopener noreferrer"`. הוסר LOW יחיד: נוסף **focus trap** מלא
(Tab/Shift+Tab לא בורחים מהדיאלוג) לפי דפוס WAI-ARIA Dialog — מונע מצב שבו
משתמש מקלדת/קורא מסך "נתקע" בתוכן חבוי מתחת לתפריט הפתוח.

### 7.7 סבב Pentest חמישי + שישי (נקי) — 2026-06-22
לאחר מיזוג PR #3 לפרודקשן, הופעל סקיל security לסבבי בדיקה חדשים על כל הקוד שנוסף
מאז סבב 4 (i18n routing, theme יום/לילה, אנימציות גזירה/מספריים, account
`force-dynamic`, מיזוג ה-PR עצמו).
- **סבב 5 — 2 ממצאי LOW תוקנו:**
  - `signUpSchema.name` (auth-schema.ts) היה בלי הגבלת אורך עליונה — קלט לא-חסום
    שמאוחסן ב-`user_metadata` של Supabase (וקטור מינורי ל-storage abuse/DoS).
    תוקן: `.max(100)`.
  - `submitContactForm` (server/actions/contact.ts) בנה את ה-subject של מייל
    ע"י הטמעת `name` שמגיע מהמשתמש ללא סינון תווי בקרה — הגנת-עומק תיאורטית
    מול email header injection אם ספק ה-API (Resend) לא יסנן זאת בעצמו. תוקן:
    הוסרו תווי `\r`/`\n` מ-`name` לפני ההטמעה ב-subject.
  - נבדקו ונמצאו תקינים: theme-toggle/cut-line-divider/scroll-feature/cut-heading/
    template.tsx/scissors-scroll-indicator (כולם דקורטיביים/בלי קלט משתמש),
    middleware.ts, rate-limit.ts, auth callback route, `safeRedirectPath`,
    contact-links.ts (כל הקלטים ל-iframe/wa.me/waze הם מ-`siteConfig` קבוע,
    לא מהמשתמש, ומקודדים כראוי), commit המיזוג עצמו (no-op בתוכן, וידוא שלא
    חזרו קבצים ישנים/לא-מתוקנים מענף הבסיס).
- **סבב 6 — נקי.** לא נמצאו ממצאים נוספים: `npm audit` עדיין מראה רק את אותו
  moderate (postcss, build-time בלבד, מתועד מסבב 3); אין סודות בהיסטוריית
  git; `prisma/schema.prisma` ללא שינוי מהותי; CI לא חושף סודות; אין
  `console.log`/debug שנשארו בקוד. ה-build המלא (28 נתיבים) ירוק.
- **סבב 7 — סקירה ממצה של כל 67 קבצי `src/**/*.{ts,tsx}`** (בתגובה לשאלת
  המשתמש "סרקת את כל הקוד?" — הסבבים הקודמים התמקדו בקבצים שהשתנו/קריטיים
  ולא בכל העץ). נקראו שורה-שורה כל הקומפוננטות, ה-routes (`[locale]/*/page.tsx`),
  `i18n/*`, `lib/config.ts`, `robots.ts`, `sitemap.ts`, `academy-data.ts`,
  `services-data.ts`, `mobile-nav.tsx`, `utils.test.ts` ועוד. **לא נמצא אף
  ממצא חדש** — כל עמודי התוכן הם presentational בלבד (תרגומים סטטיים, אין
  קלט משתמש), `AccessibilityMenu`/`mobile-nav` מטפלים נכון ב-`localStorage`
  (try/catch, ולידציה של ערכים), אין `dangerouslySetInnerHTML` נוסף מעבר
  לזה שתועד ב-`[locale]/layout.tsx`. זהו הסבב הנקי שהמשתמש בקש להגיע אליו.

---

## 8. בדיקות ו-CI
- Vitest (unit/integration), Playwright (E2E מסעות קריטיים).
- CI: lint + typecheck + test על כל PR; Vercel preview deploy.
- שער איכות: אין merge בלי ירוק + סקירת security על קוד רגיש.

---

## 9. החלטות פתוחות (לעדכן עם הזמן)
- ספק תשלום סופי (Tranzila מול HYP) — להחלטה כשנגיע לחיבור בפועל.
- האם נדרש מודול תורים (Phase 9) — תלוי בצרכי המספרה.
- ריבוי שפות (עברית/אנגלית) — כרגע עברית בלבד, הבנייה מוכנה ל-i18n.
