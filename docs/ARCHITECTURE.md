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
                  Resend (מיילים)
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
| מיילים | **Resend** | API פשוט, תבניות, deliverability טוב |
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
- **מיילים → Resend.** **תשלומים → Tranzila/HYP** (hosted, לא עוברים דרך השרת שלנו).

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
