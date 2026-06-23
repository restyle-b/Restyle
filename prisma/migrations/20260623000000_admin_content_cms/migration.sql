-- Phase 8.2+8.3+8.4: Admin CMS — שירותים/קורסים/המלצות/גלריה/טקסטי שיווק.
-- הערה: יש להריץ ידנית ב-Supabase SQL Editor (ה-sandbox חוסם TCP ל-Postgres),
-- ואז: npx prisma migrate resolve --applied 20260623000000_admin_content_cms
--
-- כולל seed-נתונים מהתוכן הסטטי הקיים (messages/*.json + services-data.ts/
-- academy-data.ts) — כך שמרגע ההרצה האתר ימשיך להציג בדיוק את אותו תוכן,
-- אך דרך ה-DB וניתן לעריכה מה-Admin.

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "nameHe" TEXT NOT NULL,
    "nameEn" TEXT,
    "nameAr" TEXT,
    "descriptionHe" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "descriptionAr" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "services_slug_key" ON "services"("slug");

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "nameHe" TEXT NOT NULL,
    "nameEn" TEXT,
    "nameAr" TEXT,
    "descriptionHe" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "descriptionAr" TEXT,
    "durationHe" TEXT NOT NULL,
    "durationEn" TEXT,
    "durationAr" TEXT,
    "levelHe" TEXT NOT NULL,
    "levelEn" TEXT,
    "levelAr" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "courses_slug_key" ON "courses"("slug");

-- CreateTable
CREATE TABLE "testimonials" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "nameHe" TEXT NOT NULL,
    "nameEn" TEXT,
    "nameAr" TEXT,
    "quoteHe" TEXT NOT NULL,
    "quoteEn" TEXT,
    "quoteAr" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gallery_images" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT NOT NULL,
    "altHe" TEXT NOT NULL,
    "altEn" TEXT,
    "altAr" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gallery_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_blocks" (
    "id" TEXT NOT NULL,
    "namespace" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "valueHe" TEXT NOT NULL,
    "valueEn" TEXT,
    "valueAr" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "content_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "content_blocks_namespace_key_key" ON "content_blocks"("namespace", "key");

-- אבטחה: RLS — קריאה ציבורית (תוכן שמוצג באתר), כתיבה רק למשתמש עם role='ADMIN'
-- בטבלת public.users. נבדק גם כאן (defense in depth) וגם ב-server action
-- (requireAdmin() ב-lib/auth/require-admin.ts) — לא להסתמך על שכבה אחת.
ALTER TABLE "services" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "courses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "testimonials" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "gallery_images" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "content_blocks" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "services_select_public" ON "services";
CREATE POLICY "services_select_public" ON "services" FOR SELECT USING (true);
DROP POLICY IF EXISTS "services_write_admin" ON "services";
CREATE POLICY "services_write_admin" ON "services" FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'ADMIN'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'ADMIN'));

DROP POLICY IF EXISTS "courses_select_public" ON "courses";
CREATE POLICY "courses_select_public" ON "courses" FOR SELECT USING (true);
DROP POLICY IF EXISTS "courses_write_admin" ON "courses";
CREATE POLICY "courses_write_admin" ON "courses" FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'ADMIN'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'ADMIN'));

DROP POLICY IF EXISTS "testimonials_select_public" ON "testimonials";
CREATE POLICY "testimonials_select_public" ON "testimonials" FOR SELECT USING (true);
DROP POLICY IF EXISTS "testimonials_write_admin" ON "testimonials";
CREATE POLICY "testimonials_write_admin" ON "testimonials" FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'ADMIN'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'ADMIN'));

DROP POLICY IF EXISTS "gallery_images_select_public" ON "gallery_images";
CREATE POLICY "gallery_images_select_public" ON "gallery_images" FOR SELECT USING (true);
DROP POLICY IF EXISTS "gallery_images_write_admin" ON "gallery_images";
CREATE POLICY "gallery_images_write_admin" ON "gallery_images" FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'ADMIN'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'ADMIN'));

DROP POLICY IF EXISTS "content_blocks_select_public" ON "content_blocks";
CREATE POLICY "content_blocks_select_public" ON "content_blocks" FOR SELECT USING (true);
DROP POLICY IF EXISTS "content_blocks_write_admin" ON "content_blocks";
CREATE POLICY "content_blocks_write_admin" ON "content_blocks" FOR ALL
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'ADMIN'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid()::text AND role = 'ADMIN'));

-- ===== Seed: תוכן קיים, כדי שהאתר יציג בדיוק את אותו דבר אחרי המעבר ל-DB =====

-- Services (seed from servicesData + services-data.ts order)
INSERT INTO public.services (id, slug, "order", "nameHe", "nameEn", "nameAr", "descriptionHe", "descriptionEn", "descriptionAr", active, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, 'haircut', 0, 'תספורת עיצוב', 'Precision Haircut', 'قصة شعر مصممة', 'תספורת מותאמת אישית לפי צורת הפנים והסגנון שלך, בליווי ייעוץ קצר.', 'A haircut tailored to your face shape and style, with a short consultation.', 'قصة شعر مصممة خصيصًا حسب شكل وجهكم وأسلوبكم، مع استشارة قصيرة.', true, now(), now()) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.services (id, slug, "order", "nameHe", "nameEn", "nameAr", "descriptionHe", "descriptionEn", "descriptionAr", active, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, 'beard', 1, 'עיצוב זקן', 'Beard Styling', 'تصميم اللحية', 'גילוח וקיצוץ מדויקים, כולל חימום מגבת חמה וטיפוח עור.', 'Precise shaving and trimming, including a hot towel treatment and skin care.', 'حلاقة وتقليم دقيقان، تشمل منشفة ساخنة والعناية بالبشرة.', true, now(), now()) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.services (id, slug, "order", "nameHe", "nameEn", "nameAr", "descriptionHe", "descriptionEn", "descriptionAr", active, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, 'coloring', 2, 'צבע וגוונים', 'Color & Highlights', 'صبغة وهايلايت', 'צביעה מקצועית והדגשות בעזרת מוצרים פרימיום, ללא פגיעה במבנה השיער.', 'Professional coloring and highlights using premium products, without damaging hair structure.', 'صبغ مهني وهايلايت باستخدام منتجات فاخرة، دون الإضرار ببنية الشعر.', true, now(), now()) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.services (id, slug, "order", "nameHe", "nameEn", "nameAr", "descriptionHe", "descriptionEn", "descriptionAr", active, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, 'treatment', 3, 'טיפולי שיער', 'Hair Treatments', 'علاجات الشعر', 'טיפולי הזנה ושיקום לשיער ולקרקפת, מותאמים לסוג השיער שלך.', 'Nourishing and restorative treatments for hair and scalp, tailored to your hair type.', 'علاجات تغذية وإصلاح للشعر وفروة الرأس، مصممة حسب نوع شعركم.', true, now(), now()) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.services (id, slug, "order", "nameHe", "nameEn", "nameAr", "descriptionHe", "descriptionEn", "descriptionAr", active, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, 'kids', 4, 'תספורת ילדים', 'Kids'' Haircuts', 'قص شعر الأطفال', 'חוויה נעימה ומהירה במספרה, בסבלנות ובמקצועיות.', 'A pleasant, quick experience at the barbershop, with patience and professionalism.', 'تجربة لطيفة وسريعة في الصالون، بصبر ومهنية.', true, now(), now()) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.services (id, slug, "order", "nameHe", "nameEn", "nameAr", "descriptionHe", "descriptionEn", "descriptionAr", active, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, 'vip', 5, 'חוויית VIP', 'VIP Experience', 'تجربة VIP', 'טיפול מקיף — תספורת, זקן וטיפוח, בליווי אישי וזמן איכות מורחב.', 'A comprehensive treatment — haircut, beard and grooming, with personal attention and extended quality time.', 'علاج شامل — قصة شعر، لحية وعناية، مع اهتمام شخصي ووقت إضافي.', true, now(), now()) ON CONFLICT (slug) DO NOTHING;

-- Courses (seed from academyData + academy-data.ts order)
INSERT INTO public.courses (id, slug, "order", "nameHe", "nameEn", "nameAr", "descriptionHe", "descriptionEn", "descriptionAr", "durationHe", "durationEn", "durationAr", "levelHe", "levelEn", "levelAr", active, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, 'barbering-foundations', 0, 'יסודות הספרות', 'Barbering Foundations', 'أساسيات الحلاقة', 'קורס בסיס למתחילים — אחיזת כלים, טכניקות גזירה, פייד וגימור. הדרך הנכונה להיכנס למקצוע.', 'A foundational course for beginners — tool handling, cutting techniques, fades and finishing. The right way to enter the profession.', 'دورة أساسية للمبتدئين — التعامل مع الأدوات، تقنيات القص، الفيد والتشطيب. الطريقة الصحيحة لدخول المهنة.', '8 שבועות', '8 weeks', '8 أسابيع', 'מתחילים', 'Beginners', 'مبتدئون', true, now(), now()) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.courses (id, slug, "order", "nameHe", "nameEn", "nameAr", "descriptionHe", "descriptionEn", "descriptionAr", "durationHe", "durationEn", "durationAr", "levelHe", "levelEn", "levelAr", active, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, 'advanced-fades', 1, 'פייד וטכניקות מתקדמות', 'Fades & Advanced Techniques', 'الفيد والتقنيات المتقدمة', 'שכלול טכניקות הפייד, מעברים חלקים, עיצוב קווים ועבודה עם מכונה ותער ברמה מקצועית.', 'Refining fade techniques, smooth transitions, line design and professional-level work with clippers and razors.', 'تحسين تقنيات الفيد، التدرجات الناعمة، تصميم الخطوط والعمل بالماكينة والموس على مستوى مهني.', '4 שבועות', '4 weeks', '4 أسابيع', 'מתקדמים', 'Advanced', 'متقدمون', true, now(), now()) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.courses (id, slug, "order", "nameHe", "nameEn", "nameAr", "descriptionHe", "descriptionEn", "descriptionAr", "durationHe", "durationEn", "durationAr", "levelHe", "levelEn", "levelAr", active, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, 'beard-design', 2, 'עיצוב זקן', 'Beard Design', 'تصميم اللحية', 'עיצוב וגילוח זקן, עבודת תער קלאסית, חימום מגבת חמה וטיפוח עור — חוויית הברבר המלאה.', 'Beard design and shaving, classic razor work, hot towel treatment and skin care — the full barber experience.', 'تصميم وحلاقة اللحية، عمل كلاسيكي بالموس، منشفة ساخنة والعناية بالبشرة — تجربة الحلاق الكاملة.', '3 שבועות', '3 weeks', '3 أسابيع', 'כל הרמות', 'All Levels', 'جميع المستويات', true, now(), now()) ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.courses (id, slug, "order", "nameHe", "nameEn", "nameAr", "descriptionHe", "descriptionEn", "descriptionAr", "durationHe", "durationEn", "durationAr", "levelHe", "levelEn", "levelAr", active, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, 'masterclass', 3, 'מאסטרקלאס מקצועי', 'Professional Masterclass', 'دورة احترافية متقدمة', 'סדנת מומחים אינטנסיבית בהדרכת הצוות המוביל של ReStyle — טרנדים, ניהול לקוח ומיתוג אישי.', 'An intensive expert workshop led by ReStyle''s leading team — trends, client management and personal branding.', 'ورشة عمل مكثفة للخبراء بإشراف فريق ريستايل المتميز — الاتجاهات، إدارة العملاء والعلامة الشخصية.', 'סדנה מרוכזת', 'Intensive Workshop', 'ورشة مكثفة', 'מקצוענים', 'Professionals', 'محترفون', true, now(), now()) ON CONFLICT (slug) DO NOTHING;

-- Testimonials (seed from testimonialsData.items)
INSERT INTO public.testimonials (id, "order", "nameHe", "nameEn", "nameAr", "quoteHe", "quoteEn", "quoteAr", active, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, 0, 'איתי כהן', 'Itay Cohen', 'إيتاي كوهين', 'הצוות מקצועי ברמה אחרת. כל פעם יוצא עם תוצאה מדויקת ומרגיש בבית.', 'The team is professional on a whole different level. Every time I leave with a precise result and feel right at home.', 'الفريق محترف على مستوى مختلف تمامًا. كل مرة أخرج بنتيجة دقيقة وأشعر أنني في بيتي.', true, now(), now());
INSERT INTO public.testimonials (id, "order", "nameHe", "nameEn", "nameAr", "quoteHe", "quoteEn", "quoteAr", active, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, 1, 'נועם לוי', 'Noam Levi', 'نوعام ليفي', 'האווירה במקום פרימיום אמיתי, והליווי האישי מורגש מהדקה הראשונה.', 'The atmosphere is truly premium, and the personal attention is felt from the very first minute.', 'الجو في المكان فاخر بحق، والاهتمام الشخصي يُلمس من اللحظة الأولى.', true, now(), now());
INSERT INTO public.testimonials (id, "order", "nameHe", "nameEn", "nameAr", "quoteHe", "quoteEn", "quoteAr", active, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, 2, 'דניאל אברהם', 'Daniel Avraham', 'دانيئيل أبراهام', 'למדתי באקדמיה ונשארתי לקוח קבוע — שילוב נדיר של מקצועיות וחום אנושי.', 'I studied at the academy and stayed on as a regular client — a rare mix of professionalism and human warmth.', 'تعلمت في الأكاديمية وبقيت عميلًا دائمًا — مزيج نادر من المهنية والحرارة الإنسانية.', true, now(), now());

-- ContentBlock (seed from messages/*.json — editable page text)
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'home', 'heroEyebrow', 'מספרת פרימיום · אקדמיה', 'Premium Barbershop · Academy', 'صالون حلاقة فاخر · أكاديمية', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'home', 'heroTitle', '{name} — דיוק, סגנון ומקצועיות', '{name} — Precision, Style & Craft', '{name} — دقة، أسلوب واحترافية', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'home', 'heroSubtitle', 'חוויית עיצוב שיער ברמה הגבוהה ביותר, צוות מקצועי ואקדמיה להכשרת מעצבים.', 'A top-tier hairstyling experience, a professional team, and an academy for training stylists.', 'تجربة تصفيف شعر على أعلى مستوى، فريق محترف وأكاديمية لتدريب المصففين.', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'home', 'bookingCta', 'קביעת תור', 'Book Now', 'حجز موعد', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'home', 'servicesCta', 'לשירותים', 'View Services', 'عرض الخدمات', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'home', 'scrollDownLabel', 'גלילה למטה', 'Scroll down', 'التمرير للأسفل', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'home', 'servicesEyebrow', 'מה שאנחנו עושים', 'What We Do', 'ما الذي نقدمه', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'home', 'servicesTitle', 'שירותי המספרה', 'Barbershop Services', 'خدمات الصالون', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'home', 'allServicesCta', 'לכל השירותים', 'All Services', 'جميع الخدمات', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'home', 'ctaEyebrow', 'קביעת תור', 'Book Now', 'حجز موعد', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'home', 'ctaTitle', 'מוכנים לתור הבא שלכם?', 'Ready for your next appointment?', 'هل أنتم جاهزون لموعدكم القادم؟', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'home', 'ctaText', 'קביעת תור מתבצעת באפליקציית ReStyle — מהירה, נוחה וזמינה 24/7.', 'Booking is done through the ReStyle app — fast, easy and available 24/7.', 'يتم حجز المواعيد من خلال تطبيق ريستايل — سريع، سهل ومتاح على مدار الساعة.', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'home', 'ctaBooking', 'קביעת תור באפליקציה', 'Book in the app', 'حجز موعد في التطبيق', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'home', 'academyImageLabel', 'תמונת אקדמיה', 'Academy photo', 'صورة الأكاديمية', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'home', 'academyEyebrow', 'האקדמיה שלנו', 'Our Academy', 'أكاديميتنا', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'home', 'academyTitle', 'למדו את המקצוע מהמיטב', 'Learn the craft from the best', 'تعلّموا المهنة من الأفضل', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'home', 'academyDescription', 'קורסים מקצועיים בעיצוב שיער ועיצוב זקן, מההתחלה ועד רמת מומחה — בהדרכת הצוות המוביל שלנו.', 'Professional courses in hairstyling and beard design, from beginner to expert level — led by our top team.', 'دورات مهنية في تصفيف الشعر وتصميم اللحية، من البداية وحتى مستوى الخبير — بإشراف فريقنا المتميز.', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'home', 'allCoursesCta', 'לכל הקורסים', 'All Courses', 'جميع الدورات', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'home', 'aboutImageLabel', 'תמונת הסטודיו', 'Studio photo', 'صورة الاستوديو', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'home', 'studioFeatureLighting', 'תאורה מקצועית', 'Professional lighting', 'إضاءة مهنية', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'home', 'studioFeatureChairs', 'כיסאות פרימיום', 'Premium chairs', 'كراسي متميزة', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'home', 'studioFeatureDesign', 'עיצוב מודרני', 'Modern design', 'تصميم عصري', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'home', 'aboutEyebrow', 'הסיפור שלנו', 'Our Story', 'قصتنا', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'home', 'aboutTitle', 'יותר ממספרה', 'More than a barbershop', 'أكثر من صالون حلاقة', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'home', 'aboutDescription', 'ReStyle נוסדה מתוך אמונה שעיצוב שיער הוא מקצוע — שילוב של אומנות, טכניקה ושירות אישי. הצוות שלנו מחויב לתוצאה ולחוויה בכל ביקור.', 'ReStyle was founded on the belief that hairstyling is a craft — a blend of art, technique and personal service. Our team is committed to the result and the experience of every visit.', 'تأسس ريستايل على الإيمان بأن تصفيف الشعر مهنة — مزيج من الفن والتقنية والخدمة الشخصية. فريقنا ملتزم بالنتيجة والتجربة في كل زيارة.', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'home', 'readMoreCta', 'קרא עוד עלינו', 'Read more about us', 'اقرأ المزيد عنا', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'home', 'galleryEyebrow', 'עבודות נבחרות', 'Selected Work', 'أعمال مختارة', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'home', 'galleryTitle', 'גלריה', 'Gallery', 'معرض الصور', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'home', 'workImageLabel', 'תמונת עבודה', 'Work photo', 'صورة عمل', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'home', 'studioImageLabel', 'הסטודיו שלנו', 'Our studio', 'الاستوديو الخاص بنا', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'home', 'fullGalleryCta', 'לגלריה המלאה', 'Full Gallery', 'المعرض الكامل', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'home', 'testimonialsEyebrow', 'מה אומרים עלינו', 'What People Say', 'ماذا يقولون عنا', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'home', 'testimonialsTitle', 'לקוחות מספרים', 'Our Clients Speak', 'يتحدث عملاؤنا', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'home', 'locationsEyebrow', 'בואו לבקר', 'Come Visit', 'تعالوا لزيارتنا', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'home', 'locationsTitle', 'מיקום ושעות פתיחה', 'Location & Opening Hours', 'الموقع وساعات العمل', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'home', 'addressLabel', 'כתובת:', 'Address:', 'العنوان:', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'home', 'phoneLabel', 'טלפון:', 'Phone:', 'الهاتف:', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'home', 'hoursLabel', 'שעות פעילות:', 'Hours:', 'ساعات العمل:', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'home', 'directionsCta', 'לפרטי הגעה ומפה', 'Directions & Map', 'تفاصيل الوصول والخريطة', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'home', 'contactEyebrow', 'יש לכם שאלה?', 'Have a question?', 'لديكم سؤال؟', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'home', 'contactTitle', 'צרו קשר', 'Contact Us', 'تواصلوا معنا', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'home', 'contactPageCta', 'לעמוד צור קשר', 'Go to Contact', 'إلى صفحة التواصل', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'about', 'metaTitle', 'אודות', 'About', 'من نحن', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'about', 'metaDescription', 'הסיפור של ReStyle — מספרה ואקדמיה פרימיום.', 'The ReStyle story — a premium barbershop and academy.', 'قصة ريستايل — صالون حلاقة وأكاديمية فاخرة.', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'about', 'eyebrow', 'הסיפור שלנו', 'Our Story', 'قصتنا', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'about', 'title', 'יותר ממספרה', 'More than a barbershop', 'أكثر من صالون حلاقة', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'about', 'description', 'ReStyle נוסדה מתוך אמונה שעיצוב שיער הוא מקצוע — שילוב של אומנות, טכניקה ושירות אישי.', 'ReStyle was founded on the belief that hairstyling is a craft — a blend of art, technique and personal service.', 'تأسس ريستايل على الإيمان بأن تصفيف الشعر مهنة — مزيج من الفن والتقنية والخدمة الشخصية.', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'about', 'teamImageLabel', 'תמונת הצוות', 'Team photo', 'صورة الفريق', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'about', 'paragraph1', 'התחלנו כסטודיו קטן עם חזון פשוט: לתת לכל לקוח חוויה מדויקת ואישית, ברמה שמוכרת ממספרות הבוטיק הטובות בעולם. עם השנים, ReStyle צמחה למותג שמשלב מספרה ואקדמיה להכשרת מעצבי שיער.', 'We started as a small studio with a simple vision: to give every client a precise, personal experience on par with the best boutique barbershops in the world. Over the years, ReStyle has grown into a brand that combines a barbershop with an academy for training hairstylists.', 'بدأنا كاستوديو صغير برؤية بسيطة: تقديم تجربة دقيقة وشخصية لكل عميل، بمستوى يضاهي أفضل صالونات الحلاقة الفاخرة في العالم. على مر السنين، نما ريستايل ليصبح علامة تجارية تجمع بين صالون الحلاقة وأكاديمية لتدريب مصففي الشعر.', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'about', 'paragraph2', 'הצוות שלנו מורכב ממעצבי שיער מוסמכים ומנוסים, שמחויבים להמשיך ולהתפתח — ומעבירים את הידע הזה גם לדור הבא של אנשי המקצוע באקדמיה שלנו.', 'Our team is made up of certified, experienced stylists who are committed to continuous growth — and they pass that knowledge on to the next generation of professionals at our academy.', 'يتكون فريقنا من مصففي شعر معتمدين وذوي خبرة، ملتزمين بالتطور المستمر — وينقلون هذه المعرفة أيضًا للجيل القادم من المهنيين في أكاديميتنا.', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'accessibility', 'metaTitle', 'הצהרת נגישות', 'Accessibility Statement', 'بيان إمكانية الوصول', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'accessibility', 'metaDescription', 'הצהרת הנגישות של אתר ReStyle — רמת התאמה, הסדרים ופרטי רכז נגישות.', 'ReStyle''s website accessibility statement — compliance level, accommodations and accessibility coordinator details.', 'بيان إمكانية الوصول لموقع ريستايل — مستوى الامتثال، الترتيبات وتفاصيل منسق إمكانية الوصول.', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'accessibility', 'eyebrow', 'מחויבות לכולם', 'Committed to Everyone', 'التزام بالجميع', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'accessibility', 'title', 'הצהרת נגישות', 'Accessibility Statement', 'بيان إمكانية الوصول', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'accessibility', 'intro', 'מספרת ReStyle רואה חשיבות רבה במתן שירות שוויוני לכלל הלקוחות, ופועלת להנגשת אתר האינטרנט שלה כדי לאפשר שימוש נוח וזמין גם לאנשים עם מוגבלות.', 'ReStyle Barbershop places great importance on providing equal service to all clients, and works to make its website accessible so that people with disabilities can use it comfortably.', 'يقدّر صالون ريستايل بشكل كبير تقديم خدمة متساوية لجميع العملاء، ويعمل على جعل موقعه الإلكتروني متاحًا لتمكين الأشخاص ذوي الإعاقة من استخدامه بسهولة ويسر.', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'accessibility', 'levelHeading', 'רמת הנגישות באתר', 'Site Accessibility Level', 'مستوى إمكانية الوصول في الموقع', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'accessibility', 'levelBody', 'האתר הונגש בהתאם להוראות תקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע"ג–2013, ובהתאם לתקן הישראלי ת"י 5568 המבוסס על הנחיות הנגישות לתכני אינטרנט WCAG 2.0 ברמה AA.', 'This site has been made accessible in accordance with the Equal Rights for Persons with Disabilities Regulations (Service Accessibility Adjustments), 2013, and in accordance with Israeli Standard IS 5568, based on the Web Content Accessibility Guidelines (WCAG) 2.0, Level AA.', 'تم تجهيز هذا الموقع وفقًا لأنظمة المساواة في الحقوق للأشخاص ذوي الإعاقة (تعديلات إمكانية الوصول للخدمة)، 2013، ووفقًا للمعيار الإسرائيلي ت"י 5568 المستند إلى إرشادات إمكانية الوصول لمحتوى الويب WCAG 2.0 بمستوى AA.', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'accessibility', 'accommodationsHeading', 'הסדרי הנגישות באתר', 'Accessibility Accommodations on the Site', 'ترتيبات إمكانية الوصول في الموقع', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'accessibility', 'limitationsHeading', 'מגבלות ידועות', 'Known Limitations', 'قيود معروفة', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'accessibility', 'limitationsBody', 'ייתכן שחלקים מסוימים באתר טרם הונגשו במלואם. אנו ממשיכים לשפר את הנגישות באופן שוטף. אם נתקלתם בתוכן שאינו נגיש — נשמח שתעדכנו אותנו ונפעל לתקן בהקדם.', 'Some parts of the site may not yet be fully accessible. We continuously work to improve accessibility. If you encounter inaccessible content, please let us know and we will act to fix it promptly.', 'قد لا تكون بعض أجزاء الموقع متاحة بالكامل حتى الآن. نواصل العمل على تحسين إمكانية الوصول بشكل مستمر. إذا صادفتم محتوى غير متاح — يسعدنا أن تخبرونا وسنعمل على إصلاحه في أقرب وقت.', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'accessibility', 'contactHeading', 'פניות בנושא נגישות', 'Accessibility Inquiries', 'استفسارات حول إمكانية الوصول', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'accessibility', 'contactIntro', 'לכל בקשה, הצעה או דיווח על תקלת נגישות, ניתן לפנות לרכז/ת הנגישות:', 'For any request, suggestion, or report of an accessibility issue, you may contact our accessibility coordinator:', 'لأي طلب أو اقتراح أو تقرير عن مشكلة في إمكانية الوصول، يمكنكم التواصل مع منسق/ة إمكانية الوصول:', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'accessibility', 'nameLabel', 'שם:', 'Name:', 'الاسم:', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'accessibility', 'phoneLabel', 'טלפון:', 'Phone:', 'الهاتف:', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'accessibility', 'emailLabel', 'אימייל:', 'Email:', 'البريد الإلكتروني:', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'accessibility', 'coordinatorName', 'צוות ReStyle', 'The ReStyle Team', 'فريق ريستايل', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'accessibility', 'updatedText', 'הצהרת נגישות זו עודכנה בתאריך {date}.', 'This accessibility statement was last updated on {date}.', 'تم تحديث هذا البيان لإمكانية الوصول بتاريخ {date}.', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'privacy', 'metaTitle', 'מדיניות פרטיות', 'Privacy Policy', 'سياسة الخصوصية', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'privacy', 'metaDescription', 'מדיניות הפרטיות של אתר ReStyle — איזה מידע נאסף, כיצד נעשה בו שימוש וזכויותיכם.', 'ReStyle''s privacy policy — what data is collected, how it''s used, and your rights.', 'سياسة الخصوصية لموقع ريستايل — البيانات التي يتم جمعها، كيفية استخدامها وحقوقكم.', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'privacy', 'eyebrow', 'שקיפות ואמון', 'Transparency & Trust', 'الشفافية والثقة', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'privacy', 'title', 'מדיניות פרטיות', 'Privacy Policy', 'سياسة الخصوصية', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'privacy', 'intro', 'מספרת ReStyle ("אנחנו") מכבדת את פרטיות המבקרים באתר. מדיניות זו מסבירה איזה מידע נאסף, למה הוא משמש, וכיצד תוכלו לממש את זכויותיכם. השימוש באתר מהווה הסכמה למדיניות זו.', 'ReStyle Barbershop ("we") respects the privacy of our website visitors. This policy explains what information is collected, what it''s used for, and how you can exercise your rights. Use of the site constitutes agreement to this policy.', 'يحترم صالون ريستايل ("نحن") خصوصية زوار الموقع. تشرح هذه السياسة ما هي المعلومات التي تُجمع، والغرض منها، وكيف يمكنكم ممارسة حقوقكم. استخدام الموقع يُعد موافقة على هذه السياسة.', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'privacy', 'dataCollectedHeading', 'איזה מידע נאסף', 'What Information Is Collected', 'ما هي المعلومات التي تُجمع', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'privacy', 'dataCollectedBody', 'המידע היחיד הנאסף הוא הפרטים שאתם בוחרים למסור בטופס "צור קשר": שם, כתובת אימייל, מספר טלפון (אופציונלי) ותוכן ההודעה. איננו אוספים מידע זה ללא מסירה יזומה מצדכם.', 'The only information collected is the details you choose to provide in the "Contact" form: name, email address, phone number (optional), and message content. We do not collect this information without your active submission.', 'المعلومات الوحيدة التي تُجمع هي التفاصيل التي تختارون تقديمها في نموذج "تواصل معنا": الاسم، عنوان البريد الإلكتروني، رقم الهاتف (اختياري) ومحتوى الرسالة. لا نجمع هذه المعلومات دون تقديمكم لها طوعًا.', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'privacy', 'dataUseHeading', 'מטרת השימוש במידע', 'Purpose of Use', 'الغرض من استخدام المعلومات', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'privacy', 'dataUseBody', 'המידע משמש אך ורק לצורך מענה לפנייתכם וחזרה אליכם. איננו עושים בו שימוש שיווקי ואיננו מעבירים אותו לצדדים שלישיים למטרות פרסום.', 'The information is used solely to respond to your inquiry and get back to you. We do not use it for marketing purposes and do not pass it on to third parties for advertising purposes.', 'تُستخدم المعلومات فقط للرد على استفساركم والتواصل معكم. لا نستخدمها لأغراض تسويقية ولا نقوم بتمريرها لأطراف ثالثة لأغراض إعلانية.', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'privacy', 'dataSharingHeading', 'העברת מידע לספקי שירות', 'Sharing Information with Service Providers', 'مشاركة المعلومات مع مزودي الخدمة', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'privacy', 'dataSharingBody', 'לצורך תפעול האתר אנו נעזרים בספקי תשתית מקובלים: שירות אירוח האתר (Vercel) ושירות שליחת דואר אלקטרוני (Resend), שדרכו נשלחת אלינו הודעת הפנייה. ספקים אלו מעבדים את המידע אך ורק לצורך אספקת השירות.', 'To operate the site, we rely on standard infrastructure providers: a website hosting service (Vercel) and an email delivery service (Resend), through which your inquiry message is sent to us. These providers process the information solely to provide their service.', 'لتشغيل الموقع، نعتمد على مزودي بنية تحتية موثوقين: خدمة استضافة الموقع (Vercel) وخدمة إرسال البريد الإلكتروني (Resend)، التي يتم من خلالها إرسال رسالة استفساركم إلينا. يقوم هؤلاء المزودون بمعالجة المعلومات فقط لغرض تقديم الخدمة.', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'privacy', 'cookiesHeading', 'הגדרות נגישות ועוגיות', 'Accessibility Settings & Cookies', 'إعدادات إمكانية الوصول وملفات تعريف الارتباط', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'privacy', 'cookiesBody', 'הגדרות תפריט הנגישות נשמרות באחסון המקומי (localStorage) של הדפדפן שלכם בלבד, אינן נשלחות אלינו ואינן מזהות אתכם. נכון למועד זה האתר אינו עושה שימוש בעוגיות מעקב או בכלי אנליטיקה. אם ייווסף בעתיד כלי כזה — מדיניות זו תעודכן בהתאם.', 'Accessibility menu settings are saved only in your browser''s local storage (localStorage), are not sent to us, and do not identify you. As of now, the site does not use tracking cookies or analytics tools. If such a tool is added in the future, this policy will be updated accordingly.', 'تُحفظ إعدادات قائمة إمكانية الوصول في التخزين المحلي (localStorage) لمتصفحكم فقط، ولا تُرسل إلينا ولا تحدد هويتكم. حتى هذا التاريخ، لا يستخدم الموقع ملفات تعريف ارتباط للتتبع أو أدوات تحليلات. في حال إضافة أداة من هذا النوع في المستقبل — سيتم تحديث هذه السياسة وفقًا لذلك.', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'privacy', 'securityHeading', 'אבטחת מידע', 'Data Security', 'أمن المعلومات', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'privacy', 'securityBody', 'התקשורת עם האתר מאובטחת בהצפנה (HTTPS). אנו נוקטים אמצעים סבירים להגנה על המידע, אך אין באפשרותנו להבטיח הגנה מוחלטת מפני כל סיכון.', 'Communication with the site is secured by encryption (HTTPS). We take reasonable measures to protect information, but we cannot guarantee absolute protection against every risk.', 'التواصل مع الموقع مؤمّن بالتشفير (HTTPS). نتخذ تدابير معقولة لحماية المعلومات، لكن لا يمكننا ضمان حماية مطلقة من كل خطر.', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'privacy', 'rightsHeading', 'זכויותיכם', 'Your Rights', 'حقوقكم', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'privacy', 'rightsBody', 'בהתאם לחוק הגנת הפרטיות, התשמ"א–1981, עומדת לכם הזכות לעיין במידע שנמסר אודותיכם, לבקש את תיקונו או מחיקתו. לפניות בנושא ניתן ליצור קשר:', 'In accordance with the Privacy Protection Law, 1981, you have the right to review information submitted about you and to request its correction or deletion. For inquiries on this matter, you may contact us:', 'وفقًا لقانون حماية الخصوصية، 1981، لكم الحق في مراجعة المعلومات المقدمة عنكم، وطلب تصحيحها أو حذفها. للاستفسارات في هذا الشأن يمكنكم التواصل معنا:', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'privacy', 'phoneLabel', 'טלפון:', 'Phone:', 'الهاتف:', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'privacy', 'emailLabel', 'אימייל:', 'Email:', 'البريد الإلكتروني:', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'privacy', 'updatedText', 'מדיניות פרטיות זו עודכנה בתאריך {date}.', 'This privacy policy was last updated on {date}.', 'تم تحديث سياسة الخصوصية هذه بتاريخ {date}.', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'terms', 'metaTitle', 'תקנון ותנאי שימוש', 'Terms of Use', 'الشروط والأحكام', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'terms', 'metaDescription', 'תנאי השימוש באתר ReStyle.', 'Terms of use for the ReStyle website.', 'شروط استخدام موقع ريستايل.', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'terms', 'eyebrow', 'הכללים שלנו', 'Our Rules', 'قواعدنا', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'terms', 'title', 'תקנון ותנאי שימוש', 'Terms of Use', 'الشروط والأحكام', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'terms', 'intro', 'ברוכים הבאים לאתר ReStyle. השימוש באתר כפוף לתנאים שלהלן. אנא קראו אותם בעיון; המשך השימוש באתר מהווה הסכמה לתנאים אלה.', 'Welcome to the ReStyle website. Use of the site is subject to the terms below. Please read them carefully; continued use of the site constitutes agreement to these terms.', 'مرحبًا بكم في موقع ريستايل. استخدام الموقع يخضع للشروط التالية. يرجى قراءتها بعناية؛ استمراركم في استخدام الموقع يُعد موافقة على هذه الشروط.', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'terms', 'natureHeading', 'אופי האתר', 'Nature of the Site', 'طبيعة الموقع', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'terms', 'natureBody', 'האתר משמש להצגת המספרה, השירותים והאקדמיה של ReStyle וליצירת קשר. קביעת תורים מתבצעת באמצעות אפליקציית ReStyle הייעודית, אליה מפנים הקישורים שבאתר.', 'The site is used to present ReStyle''s barbershop, services and academy, and for contact purposes. Appointments are booked via the dedicated ReStyle app, which the site''s links direct to.', 'يُستخدم الموقع لعرض صالون الحلاقة والخدمات والأكاديمية التابعة لريستايل وللتواصل. يتم حجز المواعيد عبر تطبيق ريستايل المخصص، الذي تشير إليه روابط الموقع.', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'terms', 'contentHeading', 'תוכן ומידע', 'Content & Information', 'المحتوى والمعلومات', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'terms', 'contentBody', 'אנו משתדלים שהמידע באתר (שירותים, קורסים, שעות פעילות ופרטי קשר) יהיה מדויק ומעודכן, אך ייתכנו שינויים, טעויות או אי-דיוקים. המידע אינו מהווה התחייבות, וייתכן שיתעדכן מעת לעת ללא הודעה מוקדמת. מחירים ופרטי קורסים סופיים יימסרו בפנייה ישירה.', 'We strive to keep the information on the site (services, courses, opening hours and contact details) accurate and up to date, but changes, errors or inaccuracies may occur. The information does not constitute a commitment and may be updated from time to time without prior notice. Final pricing and course details will be provided upon direct inquiry.', 'نسعى إلى أن تكون المعلومات الموجودة في الموقع (الخدمات، الدورات، ساعات العمل وتفاصيل التواصل) دقيقة ومحدثة، لكن قد تحدث تغييرات أو أخطاء أو عدم دقة. لا تشكّل هذه المعلومات تعهدًا، وقد تُحدّث من وقت لآخر دون إشعار مسبق. سيتم تقديم الأسعار النهائية وتفاصيل الدورات عند التواصل المباشر.', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'terms', 'ipHeading', 'קניין רוחני', 'Intellectual Property', 'الملكية الفكرية', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'terms', 'ipBody', 'כל התכנים באתר — לרבות טקסטים, עיצוב, לוגו ותמונות — הם רכושה של ReStyle ומוגנים בזכויות יוצרים. אין להעתיק, לשכפל או לעשות בהם שימוש מסחרי ללא אישור בכתב.', 'All content on the site — including text, design, logo and images — is the property of ReStyle and is protected by copyright. Copying, duplicating or making commercial use of it without written permission is prohibited.', 'جميع المحتويات الموجودة في الموقع — بما في ذلك النصوص والتصميم والشعار والصور — هي ملك لريستايل ومحمية بحقوق النشر. يُمنع نسخها أو استنساخها أو استخدامها تجاريًا دون إذن خطي.', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'terms', 'privacyHeading', 'פרטיות', 'Privacy', 'الخصوصية', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'terms', 'privacyBodyBefore', 'השימוש במידע שנמסר באתר כפוף ל', 'The use of information submitted on the site is subject to our', 'يخضع استخدام المعلومات المقدمة في الموقع لـ', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'terms', 'privacyLink', 'מדיניות הפרטיות', 'Privacy Policy', 'سياسة الخصوصية', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'terms', 'privacyBodyAfter', 'שלנו.', '.', 'الخاصة بنا.', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'terms', 'contactHeading', 'יצירת קשר', 'Contact', 'التواصل', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'terms', 'contactBodyBefore', 'לשאלות בנוגע לתקנון ניתן לפנות אלינו בטלפון', 'For questions regarding these terms, you may contact us by phone at', 'للأسئلة المتعلقة بهذه الشروط، يمكنكم التواصل معنا عبر الهاتف', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'terms', 'contactBodyMiddle', 'או באימייל', 'or by email at', 'أو عبر البريد الإلكتروني', now()) ON CONFLICT (namespace, key) DO NOTHING;
INSERT INTO public.content_blocks (id, namespace, key, "valueHe", "valueEn", "valueAr", "updatedAt") VALUES (gen_random_uuid()::text, 'terms', 'updatedText', 'תקנון זה עודכן בתאריך {date}.', 'These terms were last updated on {date}.', 'تم تحديث هذه الشروط بتاريخ {date}.', now()) ON CONFLICT (namespace, key) DO NOTHING;
