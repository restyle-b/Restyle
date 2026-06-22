-- Phase 8.1: תשתית Admin — SiteSettings + OpeningHour.
-- הערה: יש להריץ ידנית ב-Supabase SQL Editor (ה-sandbox חוסם TCP ל-Postgres),
-- ואז: npx prisma migrate resolve --applied 20260622000000_admin_site_settings

-- CreateTable
CREATE TABLE "site_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "instagramUrl" TEXT,
    "facebookUrl" TEXT,
    "appStoreUrl" TEXT,
    "googlePlayUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opening_hours" (
    "id" SERIAL NOT NULL,
    "dayOrder" INTEGER NOT NULL,
    "dayHe" TEXT NOT NULL,
    "dayEn" TEXT,
    "dayAr" TEXT,
    "hoursHe" TEXT NOT NULL,
    "hoursEn" TEXT,
    "hoursAr" TEXT,

    CONSTRAINT "opening_hours_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "opening_hours_dayOrder_key" ON "opening_hours"("dayOrder");

-- אבטחה: RLS — קריאה ציבורית (תוכן שמוצג באתר), כתיבה רק למשתמש עם role='ADMIN'
-- בטבלת public.users. נבדק גם כאן (defense in depth) וגם ב-server action
-- (requireAdmin() ב-lib/auth/require-admin.ts) — לא להסתמך על שכבה אחת.
ALTER TABLE "site_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "opening_hours" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_settings_select_public" ON "site_settings";
CREATE POLICY "site_settings_select_public"
  ON "site_settings" FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "site_settings_write_admin" ON "site_settings";
CREATE POLICY "site_settings_write_admin"
  ON "site_settings" FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'ADMIN'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'ADMIN'));

DROP POLICY IF EXISTS "opening_hours_select_public" ON "opening_hours";
CREATE POLICY "opening_hours_select_public"
  ON "opening_hours" FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "opening_hours_write_admin" ON "opening_hours";
CREATE POLICY "opening_hours_write_admin"
  ON "opening_hours" FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'ADMIN'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'ADMIN'));
