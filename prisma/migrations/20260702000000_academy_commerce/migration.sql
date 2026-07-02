-- Phase 7: רכישת קורסים (Academy commerce). ראה docs/features/ + ROADMAP.
-- הערה: להריץ דרך Supabase (SQL Editor או MCP connector), ואז:
-- npx prisma migrate resolve --applied 20260702000000_academy_commerce
--
-- דורש שמיגרציות החנות כבר רצו (enum payment_status קיים, נעשה בו שימוש חוזר).

-- הרחבת courses בשדות מסחר (כולם אופציונליים; priceAgorot=NULL → קורס תדמיתי).
ALTER TABLE "courses" ADD COLUMN "priceAgorot" INTEGER;
ALTER TABLE "courses" ADD COLUMN "depositPercent" INTEGER NOT NULL DEFAULT 20;
ALTER TABLE "courses" ADD COLUMN "capacity" INTEGER;
ALTER TABLE "courses" ADD COLUMN "detailsHe" TEXT;
ALTER TABLE "courses" ADD COLUMN "detailsEn" TEXT;
ALTER TABLE "courses" ADD COLUMN "detailsAr" TEXT;
ALTER TABLE "courses" ADD COLUMN "syllabusHe" TEXT;
ALTER TABLE "courses" ADD COLUMN "syllabusEn" TEXT;
ALTER TABLE "courses" ADD COLUMN "syllabusAr" TEXT;

-- CreateEnum
CREATE TYPE "enrollment_status" AS ENUM ('PENDING', 'DEPOSIT_PAID', 'PAID', 'CANCELLED', 'FAILED');
CREATE TYPE "enrollment_plan" AS ENUM ('DEPOSIT', 'FULL');
CREATE TYPE "course_payment_kind" AS ENUM ('DEPOSIT', 'BALANCE', 'FULL');

-- CreateTable
CREATE TABLE "enrollments" (
    "id" TEXT NOT NULL,
    "enrollmentNumber" TEXT NOT NULL,
    "courseId" TEXT,
    "courseNameHeSnapshot" TEXT NOT NULL,
    "userId" TEXT,
    "guestLookupToken" TEXT,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "plan" "enrollment_plan" NOT NULL,
    "coursePriceAgorot" INTEGER NOT NULL,
    "depositAgorot" INTEGER NOT NULL,
    "amountPaidAgorot" INTEGER NOT NULL DEFAULT 0,
    "status" "enrollment_status" NOT NULL DEFAULT 'PENDING',
    "paymentProvider" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_payments" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "kind" "course_payment_kind" NOT NULL,
    "provider" TEXT NOT NULL,
    "status" "payment_status" NOT NULL DEFAULT 'PENDING',
    "amountAgorot" INTEGER NOT NULL,
    "externalRef" TEXT,
    "last4" TEXT,
    "failureReason" TEXT,
    "rawResponseMeta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "course_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_enrollmentNumber_key" ON "enrollments"("enrollmentNumber");
CREATE UNIQUE INDEX "enrollments_guestLookupToken_key" ON "enrollments"("guestLookupToken");
CREATE INDEX "enrollments_userId_idx" ON "enrollments"("userId");
CREATE INDEX "enrollments_customerEmail_idx" ON "enrollments"("customerEmail");
CREATE INDEX "enrollments_courseId_idx" ON "enrollments"("courseId");
CREATE INDEX "course_payments_enrollmentId_idx" ON "course_payments"("enrollmentId");
CREATE INDEX "course_payments_provider_externalRef_idx" ON "course_payments"("provider", "externalRef");

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "course_payments" ADD CONSTRAINT "course_payments_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- אבטחה: RLS על שתי הטבלאות, **בלי** SELECT ציבורי — נתוני הרשמה/תשלום
-- פרטיים (כמו orders/payments). ההגנה האקטיבית היא בקוד (requireAdmin /
-- ownership check ב-server actions). ראה docs/ARCHITECTURE.md §7.0.
ALTER TABLE "enrollments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "course_payments" ENABLE ROW LEVEL SECURITY;
