-- פישוט OpeningHour — הסרת 6 שדות He/En/Ar מיותרים (שם יום + טקסט שעות
-- חופשי, שניהם ניתנים לגזירה מנתונים ניטרליים-שפה). אושרה כ-100% לא
-- בשימוש בפועל בציבורי — בטוח לאבד תוכן קיים.
ALTER TABLE "opening_hours"
  DROP COLUMN "dayHe",
  DROP COLUMN "dayEn",
  DROP COLUMN "dayAr",
  DROP COLUMN "hoursHe",
  DROP COLUMN "hoursEn",
  DROP COLUMN "hoursAr",
  ADD COLUMN "openTime" TEXT,
  ADD COLUMN "closeTime" TEXT,
  ADD COLUMN "closed" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT now();

ALTER TABLE "opening_hours" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- Seed שעות אמת (תואם למה שהוצג עד היום דרך messages/*.json +
-- OpenNowBadge הישן) כדי שהאתר הציבורי ימשיך להציג נכון מיד, בלי לחייב
-- הזנה מחדש ע"י המנהל.
INSERT INTO "opening_hours" ("dayOrder", "openTime", "closeTime", "closed", "updatedAt") VALUES
  (0, '09:00', '20:00', false, now()),
  (1, '09:00', '20:00', false, now()),
  (2, '09:00', '20:00', false, now()),
  (3, '09:00', '20:00', false, now()),
  (4, '09:00', '20:00', false, now()),
  (5, '09:00', '14:00', false, now()),
  (6, NULL, NULL, true, now())
ON CONFLICT ("dayOrder") DO UPDATE SET
  "openTime" = EXCLUDED."openTime", "closeTime" = EXCLUDED."closeTime",
  "closed" = EXCLUDED."closed", "updatedAt" = now();
