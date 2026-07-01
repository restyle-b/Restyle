-- Stage 2 (Phase 5+6): הזמנות ותשלומים. ראה docs/features/shop.md.
-- הערה: יש להריץ ידנית ב-Supabase SQL Editor (ה-sandbox חוסם TCP ל-Postgres),
-- ואז: npx prisma migrate resolve --applied 20260701000001_shop_orders_and_payments
--
-- דורש שהמיגרציה 20260701000000_shop_catalog (טבלת products) כבר רצה קודם.
-- אין seed — טבלאות אלו מתמלאות רק דרך זרימת checkout אמיתית.

-- CreateEnum
CREATE TYPE "order_status" AS ENUM ('PENDING', 'PAID', 'FULFILLED', 'COMPLETED', 'CANCELLED', 'FAILED');

-- CreateEnum
CREATE TYPE "delivery_method" AS ENUM ('PICKUP', 'DELIVERY');

-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "userId" TEXT,
    "status" "order_status" NOT NULL DEFAULT 'PENDING',
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "deliveryMethod" "delivery_method" NOT NULL,
    "shippingAgorot" INTEGER NOT NULL DEFAULT 0,
    "addressLine" TEXT,
    "addressCity" TEXT,
    "addressNotes" TEXT,
    "subtotalAgorot" INTEGER NOT NULL,
    "totalAgorot" INTEGER NOT NULL,
    "paymentProvider" TEXT,
    "guestLookupToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "nameHeSnapshot" TEXT NOT NULL,
    "unitPriceAgorot" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "lineTotalAgorot" INTEGER NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "status" "payment_status" NOT NULL DEFAULT 'PENDING',
    "amountAgorot" INTEGER NOT NULL,
    "externalRef" TEXT,
    "last4" TEXT,
    "failureReason" TEXT,
    "rawResponseMeta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "orders_guestLookupToken_key" ON "orders"("guestLookupToken");

-- CreateIndex
CREATE INDEX "orders_userId_idx" ON "orders"("userId");

-- CreateIndex
CREATE INDEX "orders_customerEmail_idx" ON "orders"("customerEmail");

-- CreateIndex
CREATE INDEX "order_items_orderId_idx" ON "order_items"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_orderId_key" ON "payments"("orderId");

-- CreateIndex
CREATE INDEX "payments_provider_externalRef_idx" ON "payments"("provider", "externalRef");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- אבטחה: RLS מופעל על כל 3 הטבלאות, אבל בכוונה **בלי** policy של SELECT
-- ציבורי — הזמנות/תשלומים הם נתונים פרטיים של לקוח, לא תוכן ציבורי כמו
-- services/products. אין policy = אין גישה כלל דרך client-side/anon key.
-- ⚠️ כמו בכל הטבלאות האחרות (ראה docs/ARCHITECTURE.md §7.0): ה-DATABASE_URL
-- של האפליקציה מתחבר כ-pooler role שעוקף RLS לחלוטין. **ההגנה האקטיבית
-- האמיתית היא בקוד** — requireAdmin() לניהול אדמין, בדיקת ownership
-- (userId/guestLookupToken) בכל server action שקורא הזמנה של לקוח. RLS כאן
-- הוא הגנת-עומק תיאורטית בלבד למקרה עתידי של קריאה ישירה מ-client.
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payments" ENABLE ROW LEVEL SECURITY;
