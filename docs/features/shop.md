# Stage 2 — חנות מלאה (Phase 4 + 5 + 6 משולבים)

> מסמך תכנון. נוצר 2026-07-01 (תהליך plan mode, אושר ע"י המשתמש). מקור אמת
> להתקדמות: `ROADMAP.md`.

## Context

Stage 1 (אתר תדמית) הושלם. המשתמש ביקש לבנות את "שלב 2" — **החנות** (לא
ה-i18n, שכבר נסגר בנפרד תחת branch `stage-2-i18n`). זו הרחבה אופציונלית
(`חלופה ב'` ב-`docs/QUOTE.md`) שהייתה חסומה עד אישור מפורש מהמשתמש — האישור
ניתן במפורש ("הכל בבת אחת").

המטרה: קטלוג מוצרים + עגלה + צ'קאאוט + תשתית תשלומים (PaymentProvider עם
Tranzila כספק מוכן-לחיבור אך לא מחובר בפועל — אין credentials אמיתיים) +
ניהול הזמנות (לקוח+אדמין) + מיילי אישור תשלום (Brevo). הכל על בסיס קונבנציות
קיימות בפרויקט (ראה §דפוסים).

הוחלט עם המשתמש:
- מלאי יורד **רק בתשלום מאומת** (לא בעת יצירת הזמנה pending) — פשוט יותר,
  הסיכון (race על יחידה אחרונה) מתקבל.
- קטלוג placeholder: **8 מוצרי טיפוח למספרה** ב-3 קטגוריות, מחירים עגולים
  לבדיקה בלבד (לא סופיים).
- מיילים: **רק אישור תשלום** (לא מיילים על שינוי סטטוס נוסף לעת עתה).
- **אזור אישי**: `/account/orders` יציג בבירור גם הזמנות בביצוע (PENDING/PAID/
  FULFILLED) וגם הושלמו (COMPLETED) — לא רק רשימה שטוחה; סינון/קיבוץ לפי
  סטטוס בעמוד עצמו.
- **חשבונית מס**: **לא בתכנון הזה**. עלה בדיון (חשבונית מס אמיתית דורשת
  מספר עוסק מורשה/פטור מרשות המסים, שלמשתמש עדיין אין) — הוחלט לדחות
  לגמרי, לא לבנות אפילו תשתית/placeholder. המשתמש יבדוק בהמשך עם איזו
  חברת הנהלת-חשבונות/סליקת-חשבוניות (למשל Green Invoice) לעבוד, ואז נחבר.
  אין שום Invoice model/עמוד/קוד בשלב זה.

## Branch

`shop-phase-4-5-6` מ-`main`. Push לפי הוראת המשתמש כרגיל; לפתוח draft PR
כשיש diff משמעותי (לא ריק).

## דפוסים קיימים לשימוש חוזר (קריטי — לא להמציא מחדש)

- **CRUD אדמין**: `src/server/actions/admin/services.ts` +
  `src/lib/admin/services-schema.ts` + `src/components/admin/services-form.tsx`
  + `src/app/admin/services/page.tsx` — `requireAdmin()` בתחילת כל action →
  zod array `.max(N)` → `db.$transaction` upsert-by-unique-key +
  deleteMany(notIn) → `revalidateTag`+`revalidatePath` לכל locale. UI:
  `react-hook-form` + `useFieldArray`.
- **קריאה ציבורית**: `src/lib/content/get-services.ts` — `unstable_cache` +
  tag, טעינה מה-DB. **סטייה מכוונת למוצרים**: אין fallback ל-JSON סטטי (בניגוד
  ל-services) — Product הוא נתון טרנזקציוני-קטלוגי, לא תוכן שיווקי; קטלוג ריק
  לפני שהמיגרציה+seed רצו הוא מצב תקין (גריד ריק, לא קריסה).
- **requireAdmin()**: `src/lib/auth/require-admin.ts` — session→role, fail-closed.
- **middleware**: `src/middleware.ts` — `PROTECTED_SEGMENTS=["/account","/admin"]`.
  `/account/orders` כבר מכוסה תחת `/account`.
- **env**: `src/lib/env.ts` — zod serverSchema/clientSchema. משתני תשלום חדשים
  **אופציונליים** (MockProvider עובד בלי כלום).
- **UI**: רק `Button`(`buttonVariants`)+`Container` קיימים כ-primitives.
  אין Card/Table — להישאר עם div גולמי + Tailwind כמו services/page.tsx.
- **תמונות**: `src/components/image-placeholder.tsx` — לשימוש לכל תמונות
  המוצרים (כמו Stage 1 עשה ל-Hero/גלריה). אין imageKey/R2 — `imageUrl: String?`
  בדיוק כמו `GalleryImage`.
- **מיילים**: `src/server/actions/contact.ts` — קריאת `fetch` גולמית ל-Brevo
  API (`api-key` header), נכשל בשקט אם `BREVO_API_KEY` חסר (dev-friendly).
  **לא Resend** (הישן ב-ARCHITECTURE.md מיושן).
- **טפסים נגישים**: `src/components/contact-form.tsx` — `label htmlFor`,
  `aria-invalid`, `aria-describedby`, honeypot, rate limit לפי IP.
- **מיגרציות**: אי אפשר להריץ `prisma migrate dev` ב-sandbox (TCP חסום אחרי
  handshake). לכתוב קובץ `migration.sql` ידנית (כמו 5 המיגרציות הקודמות,
  ראה `prisma/migrations/20260623000000_admin_content_cms/migration.sql`
  לתבנית + הערת header), למשתמש להריץ ב-Supabase SQL Editor, ואז
  `npx prisma migrate resolve --applied <name>`.
- **סקיל תשלומים**: `.claude/skills/tranzila-payments/SKILL.md` — קריטיות
  10/10. iframe/handshake (SAQ-A) הוא המסלול המומלץ, **לא** Hosted Fields
  ולא API V2 (כרטיס בשרת). סכום מחושב בשרת בלבד; callback client-side אינו
  הוכחת תשלום — רק אימות server-to-server. Idempotency לפי orderId. לעולם
  לא לאחסן PAN/CVV.

## מודל נתונים (Prisma) — תוסף ל-`prisma/schema.prisma`

כסף תמיד `Int` (אגורות). שני קבצי מיגרציה נפרדים (קטלוג / הזמנות+תשלומים)
לביקורתיות נפרדת:

```prisma
enum OrderStatus { PENDING PAID FULFILLED COMPLETED CANCELLED FAILED }
enum DeliveryMethod { PICKUP DELIVERY }
enum PaymentStatus { PENDING SUCCEEDED FAILED REFUNDED PARTIALLY_REFUNDED }

model Category {
  id String @id @default(cuid())
  slug String @unique
  order Int @default(0)
  nameHe String
  nameEn String?
  nameAr String?
  active Boolean @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  products Product[]
}

model Product {
  id String @id @default(cuid())
  slug String @unique
  order Int @default(0)
  nameHe String
  nameEn String?
  nameAr String?
  descriptionHe String @db.Text
  descriptionEn String? @db.Text
  descriptionAr String? @db.Text
  priceAgorot Int
  stock Int @default(0)
  imageUrl String?
  categoryId String?
  category Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  active Boolean @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  orderItems OrderItem[]
  @@index([categoryId])
}

model Order {
  id String @id @default(cuid())
  orderNumber String @unique
  userId String?
  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)
  status OrderStatus @default(PENDING)
  customerName String
  customerEmail String
  customerPhone String
  deliveryMethod DeliveryMethod
  shippingAgorot Int @default(0)
  addressLine String?
  addressCity String?
  addressNotes String?
  subtotalAgorot Int
  totalAgorot Int
  paymentProvider String?
  guestLookupToken String? @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  items OrderItem[]
  payment Payment?
  @@index([userId])
  @@index([customerEmail])
}

model OrderItem {
  id String @id @default(cuid())
  orderId String
  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId String?
  product Product? @relation(fields: [productId], references: [id], onDelete: SetNull)
  nameHeSnapshot String
  unitPriceAgorot Int
  quantity Int
  lineTotalAgorot Int
  @@index([orderId])
}

model Payment {
  id String @id @default(cuid())
  orderId String @unique
  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
  provider String
  status PaymentStatus @default(PENDING)
  amountAgorot Int
  externalRef String?
  last4 String?
  failureReason String?
  rawResponseMeta Json?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@index([provider, externalRef])
}
```

`User` מקבל `orders Order[]`. RLS על כל הטבלאות החדשות (SELECT פתוח ל-
categories/products, ללא SELECT ציבורי ל-orders/order_items/payments —
אכיפה בפועל היא ב-`requireAdmin()`/ownership checks בקוד, לא RLS, בדיוק
כמו שמתועד ב-`docs/ARCHITECTURE.md §7.0` לגבי שאר הטבלאות — לתעד זאת שוב
בהערת ה-migration).

**עגלה**: **בלי טבלת DB** — Context+localStorage בצד לקוח בלבד
(`src/lib/cart/`). המחיר בעגלה הוא רק תצוגה; הצ'קאאוט מחשב הכל מחדש מה-DB.
**Checkout**: guest checkout מותר (כמו services וכו' — auth קיים אך לא נדרש
בניווט, בהתאם למדיניות Stage 1). משתמש מחובר → `Order.userId` מתמלא
אוטומטית. אורח → `guestLookupToken` אקראי (32 בייט), נשלח במייל ל-lookup.

## PaymentProvider (Phase 5)

`src/lib/payments/index.ts` — ממשק:
```ts
interface PaymentProvider {
  createCheckout(input: CheckoutInput): Promise<CheckoutResult>;
  verifyCallback(req: Request): Promise<PaymentResult>;
  refund(providerRef: string, amountAgorot: number): Promise<RefundResult>;
}
```
- `src/lib/payments/mock-provider.ts` — `redirectUrl` לעמוד mock-pay
  בתוך-האפליקציה ("סימולציית הצלחה/כישלון"), חוסם ב-production אם
  `PAYMENT_PROVIDER==="tranzila"`.
- `src/lib/payments/tranzila-provider.ts` — שלד קוד-שלם לפי הזרימה החובה
  בסקיל (handshake→iframe, אימות callback + קריאת Inquire נוספת
  server-to-server, idempotency, refund) — **לא ניתן לבדיקה חיה** בלי
  credentials אמיתיים; מוגן מאחורי `PAYMENT_PROVIDER` env var שברירת המחדל
  שלו "mock".
- `src/lib/payments/get-provider.ts` — בררת מחדל בטוחה ל-mock בכל מקרה של
  ספק לא מזוהה.
- Webhook: `src/app/api/payments/webhook/route.ts`.
- env חדשים (אופציונליים ב-zod): `PAYMENT_PROVIDER` (enum mock|tranzila,
  default mock), `PAYMENT_WEBHOOK_SECRET`, `TRANZILA_TERMINAL`,
  `TRANZILA_TERMINAL_PASSWORD` — `getServerEnv()` זורק אם provider=tranzila
  בלי שני משתני הטרמינל.

## זרימת Checkout (Phase 4+5)

`src/server/actions/shop/create-order.ts`: rate-limit → zod (רק
`{productId, quantity}[]`, **לא** מקבל מחיר/שם מהקליינט בכלל) →
`db.product.findMany` לפי ids פעילים → חישוב subtotal/shipping(0 או 4000
אגורות)/total **בשרת בלבד** → יצירת `Order`(PENDING)+`OrderItem[]`
בטרנזקציה → `PaymentProvider.createCheckout()` → מחזיר redirect URL.

`src/server/actions/orders/handle-payment-result.ts` — נקודת אמת יחידה:
נקרא גם מ-webhook האמיתי וגם מ-mock-callback route (אותה לוגיקה בדיוק).
idempotent (בודק `Payment.status` קיים לפני עדכון; `@unique orderId` על
Payment כגיבוי DB-level). PAID→ מוריד `Product.stock` (רק כאן, לא ב-pending)
+ שולח מייל אישור (Brevo, best-effort — כישלון שליחה לא מפיל את הטרנזקציה).

## עמודים ציבוריים

```
src/app/[locale]/shop/page.tsx              — קטלוג + סינון קטגוריה (?category=)
src/app/[locale]/shop/[slug]/page.tsx       — דף מוצר
src/app/[locale]/cart/page.tsx              — עגלה (client)
src/app/[locale]/checkout/page.tsx          — טופס צ'קאאוט
src/app/[locale]/checkout/success/page.tsx  — מציג סטטוס מה-DB בלבד, לא "מסמן" כלום
src/app/[locale]/checkout/cancel/page.tsx
src/app/[locale]/account/orders/page.tsx           — היסטוריה למשתמש מחובר, מקובצת: "בביצוע" (PENDING/PAID/FULFILLED) מול "הושלמו" (COMPLETED/CANCELLED/FAILED)
src/app/[locale]/account/orders/[orderNumber]/page.tsx — ownership check עצמאי
src/app/[locale]/orders/lookup/page.tsx     — guest lookup (token+orderNumber)
```
תבנית זהה ל-`services/page.tsx` (generateMetadata, getTranslations, Container+
SectionHeading, גריד רספונסיבי). קומפוננטה חדשה יחידה: `src/components/shop/product-card.tsx`
(shop-scoped, לא ui/ גנרי — עקבי עם המינימליזם הקיים).

## ניהול אדמין

`/admin/products`, `/admin/categories` — טריפלט זהה ל-services (action+schema+form+page).
`/admin/orders` + `/admin/orders/[orderNumber]` — `src/server/actions/admin/orders.ts`
(list/get/updateStatus עם allow-list מעברי סטטוס חוקיים, לא כל-לכל/refund-trigger).
להוסיף קישורי ניווט ב-`src/app/admin/layout.tsx`.

## ניווט + i18n

- `src/lib/config.ts` → `navLinks` מקבל `{href:"/shop", key:"shop"}`.
- `site-header.tsx`/`mobile-nav.tsx` → אייקון עגלה עם badge כמות
  (`src/components/cart/cart-icon-link.tsx`, `"use client"`, hydration-safe
  כמו שכבר קיים ב-ThemeToggle — לבדוק שם את הטכניקה).
- namespaces חדשים ב-`messages/{he,en,ar}.json`: `shop`, `cart`, `checkout`,
  `orders`. **בלי** `shopData` — תוכן המוצרים חי רק ב-DB (אין JSON fallback,
  ראה §דפוסים).

## seed placeholder (במיגרציית הקטלוג)

3 קטגוריות: `hair-care`, `beard-care`, `tools`. 8 מוצרים (שמות/מחירים לבדיקה
בלבד, `imageUrl=NULL`→placeholder, `stock=50`, `active=true`): שמפו פרימיום
(49₪), חימר עיצוב מאט (59₪), פומייד קלאסי (55₪), שמן זקן (69₪), באלם זקן
(65₪), מסרק עץ (39₪), מברשת שיער טבעית (79₪), סט טיפוח לנסיעות (129₪).

## אבטחה (חובה security+tranzila-payments skills לפני QA)

- מחיר/סכום **תמיד** מחושב בשרת מה-DB — zod לא מקבל שדות מחיר מהקליינט בכלל.
- Idempotency אמיתי: `Payment.orderId @unique` + בדיקת status-לפני-כתיבה.
- `TranzilaProvider.verifyCallback` עושה קריאת Inquire נוספת (לא סומך על ה-callback body בלבד).
- IDOR: `/account/orders/[orderNumber]` בודק `userId` בעצמו (לא סומך רק על סינון הרשימה); guest lookup דורש token+orderNumber יחד.
- Rate limit על `createOrder` + guest lookup.
- לוגים: אף פעם לא body מלא של תשלום; רק orderId+status+timestamp.
- אין PAN/CVV באף קובץ.
- `env.ts` נכשל בקול רם (בזמן boot) אם provider=tranzila בלי סודות.

## סדר בנייה (כל שלב עומד בפני עצמו — commit נפרד, typecheck/lint/test/build ירוקים)

1. **סכימה+מיגרציה** — Prisma models, 2 קבצי SQL (קטלוג / הזמנות+תשלומים), RLS, seed.
2. **קטלוג ציבורי** — get-products/get-categories, `/shop`, `/shop/[slug]`, ProductCard, `formatAgorot` helper (`src/lib/format.ts`).
3. **עגלה** — CartProvider/useCart, `/cart`, אייקון בheader.
4. **Checkout+MockProvider** — schema+form+create-order action, PaymentProvider+mock, mock-pay page, handle-payment-result (idempotent), success/cancel pages. **השלב הכי רגיש — לעבור עליו שוב לפני מעבר הלאה.**
5. **מייל אישור** — Brevo, best-effort.
6. **היסטוריית הזמנות** — account/orders (מקובץ בביצוע/הושלמו), lookup לאורחים.
7. **אדמין** — products/categories CRUD + orders management.
8. **TranzilaProvider skeleton** — קוד בלבד, env vars, webhook route.
9. **ניווט** — navLinks+cart icon+i18n nav.shop בכל 3 שפות.
10. **security review** (2 סקילים) על כל ה-diff.
11. **QA** — עגלה, checkout מלא (הצלחה/כישלון מדומה), הרשמה/אורח, אדמין,
    מיילים, RTL/נגישות. עדכון ROADMAP.md בסוף כולל רשימת "מה נשאר מהמשתמש"
    (Tranzila credentials אמיתיים; חשבונית מס — נדחה, יוחלט בהמשך עם איזו
    חברה לעבוד).

## אימות (לכל שלב)

- `npx tsc --noEmit && npm run lint && npm test && npm run build` ירוקים.
- שרת מקומי עם `.env.local` דמה (כמו בסשנים קודמים) + בדיקות ידניות/Playwright
  לזרימת עגלה→checkout→mock payment→success page→היסטוריית הזמנות.
- מיגרציה: קובץ SQL מוכן להרצה ידנית ב-Supabase SQL Editor (לא ניתן להריץ
  בפועל ב-sandbox) — להנחות את המשתמש בדיוק כמו במיגרציות קודמות.
