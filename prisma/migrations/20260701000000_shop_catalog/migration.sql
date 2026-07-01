-- Stage 2 (Phase 4): קטלוג החנות — קטגוריות ומוצרים. ראה docs/features/shop.md.
-- הערה: יש להריץ ידנית ב-Supabase SQL Editor (ה-sandbox חוסם TCP ל-Postgres),
-- ואז: npx prisma migrate resolve --applied 20260701000000_shop_catalog
--
-- כולל seed placeholder (8 מוצרי טיפוח בשלוש קטגוריות, מחירים לבדיקה בלבד —
-- לא סופיים, ראה docs/features/shop.md).

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "nameHe" TEXT NOT NULL,
    "nameEn" TEXT,
    "nameAr" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "nameHe" TEXT NOT NULL,
    "nameEn" TEXT,
    "nameAr" TEXT,
    "descriptionHe" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "descriptionAr" TEXT,
    "priceAgorot" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "categoryId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE INDEX "products_categoryId_idx" ON "products"("categoryId");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- אבטחה: RLS — קריאה ציבורית (קטלוג מוצג באתר), כתיבה רק למשתמש עם
-- role='ADMIN' בטבלת public.users. נבדק גם כאן (defense in depth) וגם
-- ב-server action (requireAdmin() ב-lib/auth/require-admin.ts) — לא להסתמך
-- על שכבה אחת. ⚠️ הערה חשובה (ראה docs/ARCHITECTURE.md §7.0): ה-DATABASE_URL
-- של האפליקציה מתחבר כ-pooler role שעוקף RLS לחלוטין — ה-policies כאן הן
-- הגנת-עומק תיאורטית למקרה עתידי של קריאה ישירה מ-client, לא ההגנה האקטיבית.
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_select_public" ON "categories";
CREATE POLICY "categories_select_public" ON "categories" FOR SELECT USING (true);
DROP POLICY IF EXISTS "categories_write_admin" ON "categories";
CREATE POLICY "categories_write_admin" ON "categories" FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'ADMIN'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'ADMIN'));

DROP POLICY IF EXISTS "products_select_public" ON "products";
CREATE POLICY "products_select_public" ON "products" FOR SELECT USING (true);
DROP POLICY IF EXISTS "products_write_admin" ON "products";
CREATE POLICY "products_write_admin" ON "products" FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'ADMIN'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'ADMIN'));

-- ===== Seed: קטלוג placeholder (מחירים/שמות לבדיקה בלבד, לא סופיים) =====

INSERT INTO public.categories (id, slug, "order", "nameHe", "nameEn", "nameAr", active, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, 'hair-care', 0, 'טיפוח שיער', 'Hair Care', 'العناية بالشعر', true, now(), now()) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.categories (id, slug, "order", "nameHe", "nameEn", "nameAr", active, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, 'beard-care', 1, 'טיפוח זקן', 'Beard Care', 'العناية باللحية', true, now(), now()) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.categories (id, slug, "order", "nameHe", "nameEn", "nameAr", active, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, 'tools', 2, 'כלים ואביזרים', 'Tools & Accessories', 'أدوات وإكسسوارات', true, now(), now()) ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (id, slug, "order", "nameHe", "nameEn", "nameAr", "descriptionHe", "descriptionEn", "descriptionAr", "priceAgorot", stock, "categoryId", active, "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, 'premium-shampoo', 0, 'שמפו פרימיום לגברים', 'Premium Men''s Shampoo', 'شامبو فاخر للرجال', 'שמפו מקצועי לניקוי עדין וטיפוח יומיומי.', 'A professional shampoo for gentle cleansing and daily care.', 'شامبو احترافي للتنظيف اللطيف والعناية اليومية.', 4900, 50, (SELECT id FROM public.categories WHERE slug = 'hair-care'), true, now(), now()) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.products (id, slug, "order", "nameHe", "nameEn", "nameAr", "descriptionHe", "descriptionEn", "descriptionAr", "priceAgorot", stock, "categoryId", active, "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, 'matte-clay', 1, 'חימר עיצוב מאט', 'Matte Styling Clay', 'طين تصفيف مطفي', 'עיצוב חזק וגימור מאט לאורך כל היום.', 'Strong hold with a matte finish that lasts all day.', 'تثبيت قوي مع لمسة نهائية غير لامعة تدوم طوال اليوم.', 5900, 50, (SELECT id FROM public.categories WHERE slug = 'hair-care'), true, now(), now()) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.products (id, slug, "order", "nameHe", "nameEn", "nameAr", "descriptionHe", "descriptionEn", "descriptionAr", "priceAgorot", stock, "categoryId", active, "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, 'pomade-classic', 2, 'פומייד קלאסי', 'Classic Pomade', 'بوماد كلاسيكي', 'ברק וגימור קלאסי, קל לשטיפה.', 'Classic shine and finish, easy to wash out.', 'لمعان وتشطيب كلاسيكي، سهل الغسل.', 5500, 50, (SELECT id FROM public.categories WHERE slug = 'hair-care'), true, now(), now()) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.products (id, slug, "order", "nameHe", "nameEn", "nameAr", "descriptionHe", "descriptionEn", "descriptionAr", "priceAgorot", stock, "categoryId", active, "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, 'beard-oil', 0, 'שמן זקן', 'Beard Oil', 'زيت اللحية', 'שמן מזין לריכוך והברקת הזקן.', 'A nourishing oil to soften and shine your beard.', 'زيت مغذٍّ لتليين وتلميع اللحية.', 6900, 50, (SELECT id FROM public.categories WHERE slug = 'beard-care'), true, now(), now()) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.products (id, slug, "order", "nameHe", "nameEn", "nameAr", "descriptionHe", "descriptionEn", "descriptionAr", "priceAgorot", stock, "categoryId", active, "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, 'beard-balm', 1, 'באלם זקן', 'Beard Balm', 'بلسم اللحية', 'עיצוב ולחות לזקן לאורך כל היום.', 'Shape and moisture for your beard, all day long.', 'تشكيل وترطيب للحية طوال اليوم.', 6500, 50, (SELECT id FROM public.categories WHERE slug = 'beard-care'), true, now(), now()) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.products (id, slug, "order", "nameHe", "nameEn", "nameAr", "descriptionHe", "descriptionEn", "descriptionAr", "priceAgorot", stock, "categoryId", active, "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, 'beard-comb-wood', 0, 'מסרק עץ לזקן', 'Wooden Beard Comb', 'مشط خشبي للحية', 'מסרק עץ איכותי, נעים למגע ולא סטטי.', 'A quality wooden comb, smooth to the touch and anti-static.', 'مشط خشبي عالي الجودة، ناعم الملمس ومضاد للكهرباء الساكنة.', 3900, 50, (SELECT id FROM public.categories WHERE slug = 'tools'), true, now(), now()) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.products (id, slug, "order", "nameHe", "nameEn", "nameAr", "descriptionHe", "descriptionEn", "descriptionAr", "priceAgorot", stock, "categoryId", active, "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, 'boar-bristle-brush', 1, 'מברשת שיער טבעית', 'Boar Bristle Brush', 'فرشاة شعر خنزير بري طبيعية', 'מברשת זיפים טבעיים לחלוקת שמנים ועיצוב.', 'A natural bristle brush for oil distribution and styling.', 'فرشاة بشعيرات طبيعية لتوزيع الزيوت والتصفيف.', 7900, 50, (SELECT id FROM public.categories WHERE slug = 'tools'), true, now(), now()) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.products (id, slug, "order", "nameHe", "nameEn", "nameAr", "descriptionHe", "descriptionEn", "descriptionAr", "priceAgorot", stock, "categoryId", active, "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, 'travel-grooming-kit', 2, 'סט טיפוח לנסיעות', 'Travel Grooming Kit', 'طقم عناية للسفر', 'סט קומפקטי לטיפוח בדרכים.', 'A compact kit for grooming on the go.', 'طقم مدمج للعناية أثناء التنقل.', 12900, 50, (SELECT id FROM public.categories WHERE slug = 'tools'), true, now(), now()) ON CONFLICT (slug) DO NOTHING;
