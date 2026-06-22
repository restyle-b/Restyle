-- אבטחה (HIGH): מניעת הסלמת הרשאות דרך RLS.
-- ה-policy "users_update_own" מאפשר למשתמש לעדכן את השורה שלו, כולל העמודה role.
-- בלי ההגנה הזו, משתמש מחובר יכול לעדכן role='ADMIN' לעצמו ישירות דרך
-- PostgREST עם ה-anon key (החשוף ב-client) ולהפוך לאדמין.
--
-- הערה: יש להריץ ידנית ב-Supabase SQL Editor (ה-sandbox חוסם TCP ל-Postgres),
-- ואז: npx prisma migrate resolve --applied 20260618120000_prevent_role_escalation

-- trigger שמאפס כל ניסיון לשנות role דרך עדכון רגיל (anon/authenticated).
-- שינוי role לגיטימי ייעשה רק בצד שרת עם service-role key (שעוקף RLS וטריגרים
-- מסוג זה לא חלים עליו כשמריצים דרך מסלול ניהולי ייעודי ב-Phase 8).
CREATE OR REPLACE FUNCTION public.prevent_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- אם המבצע אינו service_role — אוכפים שה-role לא משתנה
  IF current_setting('request.jwt.claims', true)::jsonb ->> 'role' IS DISTINCT FROM 'service_role' THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      NEW.role := OLD.role;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS users_prevent_role_change ON public.users;
CREATE TRIGGER users_prevent_role_change
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_change();
