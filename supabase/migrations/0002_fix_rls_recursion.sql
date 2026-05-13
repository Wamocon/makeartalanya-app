-- Fix recursive RLS policies on profiles/bookings/subscriptions
-- Root cause: policies referenced profiles from within profiles-dependent policies,
-- which triggered infinite recursion for anonymous/public requests.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_trainer()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'trainer')
  );
$$;

DROP POLICY IF EXISTS "profiles_admin" ON profiles;
DROP POLICY IF EXISTS "bookings_admin" ON bookings;
DROP POLICY IF EXISTS "subscriptions_admin" ON subscriptions;

CREATE POLICY "profiles_admin" ON profiles
  FOR ALL USING (public.is_admin());

CREATE POLICY "bookings_admin" ON bookings
  FOR ALL USING (public.is_admin_or_trainer());

CREATE POLICY "subscriptions_admin" ON subscriptions
  FOR ALL USING (public.is_admin());
