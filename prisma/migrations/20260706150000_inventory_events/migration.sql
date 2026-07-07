-- CreateEnum
CREATE TYPE "inventory_reason" AS ENUM ('SALE', 'RESTOCK', 'MANUAL_ADJUST', 'ORDER_CANCELLED');

-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "lowStockThreshold" INTEGER NOT NULL DEFAULT 5;

-- CreateTable
CREATE TABLE "inventory_events" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "reason" "inventory_reason" NOT NULL,
    "resultingStock" INTEGER NOT NULL,
    "orderId" TEXT,
    "actorEmail" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inventory_events_productId_createdAt_idx" ON "inventory_events"("productId", "createdAt");

-- AddForeignKey
ALTER TABLE "inventory_events" ADD CONSTRAINT "inventory_events_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_events" ADD CONSTRAINT "inventory_events_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RLS — פרטי (Pattern B, כמו promotions/coupons): אין SELECT ציבורי בכלל.
-- יומן המלאי הוא נתון ניהולי-פנימי בלבד, נקרא/נכתב תמיד דרך Prisma
-- (server actions מאומתי-אדמין / handle-payment-result), לא ע"י anon client.
ALTER TABLE "inventory_events" ENABLE ROW LEVEL SECURITY;
