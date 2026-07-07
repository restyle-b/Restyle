-- AlterTable
ALTER TABLE "products" ADD COLUMN     "publishAt" TIMESTAMP(3),
ADD COLUMN     "seoTitleHe" TEXT,
ADD COLUMN     "seoTitleEn" TEXT,
ADD COLUMN     "seoTitleAr" TEXT,
ADD COLUMN     "seoDescriptionHe" TEXT,
ADD COLUMN     "seoDescriptionEn" TEXT,
ADD COLUMN     "seoDescriptionAr" TEXT;

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "publishAt" TIMESTAMP(3),
ADD COLUMN     "seoTitleHe" TEXT,
ADD COLUMN     "seoTitleEn" TEXT,
ADD COLUMN     "seoTitleAr" TEXT,
ADD COLUMN     "seoDescriptionHe" TEXT,
ADD COLUMN     "seoDescriptionEn" TEXT,
ADD COLUMN     "seoDescriptionAr" TEXT;

-- CreateIndex
CREATE INDEX "products_active_publishAt_idx" ON "products"("active", "publishAt");

-- CreateIndex
CREATE INDEX "courses_active_publishAt_idx" ON "courses"("active", "publishAt");

-- אין RLS חדש — עמודות אדיטיביות בטבלאות ציבוריות קיימות (products/courses,
-- Pattern A: SELECT ציבורי + WRITE אדמין), יורשות את המדיניות הקיימת.
