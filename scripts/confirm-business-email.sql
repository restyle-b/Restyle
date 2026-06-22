-- חד-פעמי: אישור ידני של כתובת המייל העסקית, מכיוון שמייל האימות מ-Supabase
-- לא הגיע בצורה אמינה (SMTP חינמי מובנה, נוטה להיתפס כספאם/חסימה ב-Outlook).
-- לא חלק מ-prisma/migrations — לא רץ אוטומטית.
--
-- הרצה: Supabase Dashboard → SQL Editor (לא ניתן להריץ מה-sandbox — חסום TCP).
--
-- תנאי מוקדם: חובה שתהיה הרשמה קיימת עם המייל הזה (נראית ב-Authentication → Users).

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE lower(email) = lower('Restyle.Barbershop@outlook.com')
  ) THEN
    RAISE EXCEPTION
      'לא נמצא משתמש עם המייל Restyle.Barbershop@outlook.com — יש להירשם דרך /register קודם.';
  END IF;
END $$;

UPDATE auth.users
SET email_confirmed_at = now()
WHERE lower(email) = lower('Restyle.Barbershop@outlook.com')
  AND email_confirmed_at IS NULL;

-- אימות — אמור להחזיר email_confirmed_at שאינו NULL:
SELECT id, email, email_confirmed_at FROM auth.users
WHERE lower(email) = lower('Restyle.Barbershop@outlook.com');
