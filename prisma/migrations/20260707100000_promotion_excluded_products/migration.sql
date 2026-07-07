-- CreateTable
CREATE TABLE "promotion_excluded_products" (
    "promotionId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "promotion_excluded_products_pkey" PRIMARY KEY ("promotionId","productId")
);

-- AddForeignKey
ALTER TABLE "promotion_excluded_products" ADD CONSTRAINT "promotion_excluded_products_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_excluded_products" ADD CONSTRAINT "promotion_excluded_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RLS — פרטי (Pattern B, כמו promotion_products/promotion_categories): אין
-- SELECT ציבורי בכלל, אותה סמנטיקה בדיוק — רק הפוך (רשימת החרגה במקום זכאות).
ALTER TABLE "promotion_excluded_products" ENABLE ROW LEVEL SECURITY;
