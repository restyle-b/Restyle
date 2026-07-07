-- היסטוריית סטטוס להזמנות והרשמות — כל מעבר סטטוס נשמר עם מקור השינוי
-- (אדמין/תשלום/מערכת), מוצג למנהל וללקוח. 2026-07-03.

CREATE TABLE "order_status_events" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "fromStatus" "order_status",
    "toStatus" "order_status" NOT NULL,
    "changedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_status_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "order_status_events_orderId_idx" ON "order_status_events"("orderId");

ALTER TABLE "order_status_events" ADD CONSTRAINT "order_status_events_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "enrollment_status_events" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "fromStatus" "enrollment_status",
    "toStatus" "enrollment_status" NOT NULL,
    "changedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enrollment_status_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "enrollment_status_events_enrollmentId_idx" ON "enrollment_status_events"("enrollmentId");

ALTER TABLE "enrollment_status_events" ADD CONSTRAINT "enrollment_status_events_enrollmentId_fkey"
    FOREIGN KEY ("enrollmentId") REFERENCES "enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RLS — כמו orders/enrollments: אין SELECT ציבורי; הגישה דרך Prisma (service role) בלבד.
ALTER TABLE "order_status_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "enrollment_status_events" ENABLE ROW LEVEL SECURITY;
