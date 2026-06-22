-- Phase 3: סנכרון auth.users -> public.users + RLS
-- הערה: יש להריץ ידנית ב-Supabase SQL Editor (כמו ה-migration הקודם),
-- כיוון שה-sandbox חוסם TCP ל-Postgres ולא ניתן להריץ `prisma migrate deploy`.
-- אחרי הרצה: `npx prisma migrate resolve --applied 20260617010000_auth_sync_and_rls`.

-- פונקציית trigger: יוצרת שורה ב-public.users בעת הרשמה ל-auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, "createdAt", "updatedAt")
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'name',
    'USER',
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Row Level Security על public.users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own" ON public.users;
CREATE POLICY "users_select_own"
  ON public.users FOR SELECT
  USING (auth.uid()::text = id);

DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

-- אין מדיניות INSERT/DELETE ללקוח — יצירה רק דרך ה-trigger (SECURITY DEFINER),
-- ומחיקה/ניהול אדמין רק דרך service-role key בצד שרת (Phase 8).
