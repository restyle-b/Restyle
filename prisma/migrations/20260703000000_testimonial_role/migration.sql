-- הוספת שדה "תפקיד" (אופציונלי) למלצות — לתמיכה בפורמט "שם · תפקיד" בעיצוב
-- החדש של סקציית ההמלצות בדף הבית (ציטוט מוביל גדול + 2 ציטוטים קטנים, ראה
-- design handoff מ-2026-07-03). לא נדרש שינוי RLS — המדיניות הקיימת על
-- testimonials היא ברמת שורה, לא עמודה.
ALTER TABLE "testimonials" ADD COLUMN "roleHe" TEXT;
ALTER TABLE "testimonials" ADD COLUMN "roleEn" TEXT;
ALTER TABLE "testimonials" ADD COLUMN "roleAr" TEXT;
