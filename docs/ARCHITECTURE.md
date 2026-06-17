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
- **Appointment** (עתידי) — userId, serviceId, startsAt, status.
- **Payment** — id, orderId/enrollmentId, provider, externalRef, amountAgorot, status.

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
