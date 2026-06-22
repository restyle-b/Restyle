-- חד-פעמי: הענקת הרשאת ADMIN למייל העסק.
-- לא חלק מ-prisma/migrations — לא רץ אוטומטית, אסור להפעיל יותר מפעם אחת
-- בלי לבדוק קודם שזה עדיין נכון (ראה SELECT לאימות בסוף הקובץ).
--
-- הרצה: Supabase Dashboard → SQL Editor (לא ניתן להריץ מה-sandbox — חסום TCP).
--
-- תנאי מוקדם: חובה שתהיה הרשמה קיימת ב-/register עם המייל הזה לפני ההרצה —
-- ה-trigger `handle_new_user` (migration 20260617010000) הוא היחיד שיוצר שורה
-- ב-public.users, וזה קורה רק בהרשמה.
--
-- ⚠️ קריטי: ה-trigger `users_prevent_role_change` (migration 20260618120000,
-- תיקון אבטחה למניעת הסלמת הרשאות) חוסם כל שינוי ל-role שלא מגיע מ-service_role
-- דרך PostgREST — כולל UPDATE ישיר מה-SQL Editor (אין שם request.jwt.claims,
-- אז התנאי "IS DISTINCT FROM 'service_role'" יוצא TRUE והשינוי מתאפס בשקט,
-- בלי שגיאה). לכן מנטרלים את ה-trigger זמנית, בתוך טרנזקציה אחת, ומחזירים
-- אותו מופעל באותה נשימה — לא משאירים את ה-trigger כבוי.

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.users WHERE lower(email) = lower('Restyle.Barbershop@outlook.com')
  ) THEN
    RAISE EXCEPTION
      'לא נמצא משתמש עם המייל Restyle.Barbershop@outlook.com — יש להירשם דרך /register קודם.';
  END IF;
END $$;

ALTER TABLE public.users DISABLE TRIGGER users_prevent_role_change;

UPDATE public.users
SET role = 'ADMIN'
WHERE lower(email) = lower('Restyle.Barbershop@outlook.com');

ALTER TABLE public.users ENABLE TRIGGER users_prevent_role_change;

COMMIT;

-- אימות — אמור להחזיר role = 'ADMIN':
SELECT id, email, role FROM public.users WHERE lower(email) = lower('Restyle.Barbershop@outlook.com');
