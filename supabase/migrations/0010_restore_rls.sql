-- 0010_restore_rls.sql
--
-- WHY THIS EXISTS
-- The live database drifted away from the migration files. Probing the project
-- with the publishable key — the one that ships inside every page's JavaScript —
-- on 31.07.2026 showed that an anonymous caller could read every row of
-- public.bookings, including guest_name, guest_phone, guest_email and message
-- for real customers.
--
-- The cause is not a missing ALTER TABLE. public.bookings is a VIEW over
-- legacy_bookings, created without security_invoker. A view runs with the
-- privileges of its owner, so it reads straight past the row level security on
-- the table underneath. legacy_bookings itself is correctly protected: the same
-- eight rows return 0 to an anonymous caller when read directly, and 8 when read
-- through the view. Writes were never exposed — an anonymous INSERT through the
-- view is rewritten onto the base table and rejected there with 42501.
--
-- So: confidentiality was breached, integrity was not.
--
-- 0004 (site_content) and 0008 (chat, presence) were never applied at all, which
-- is why those tables are absent from the project.
--
-- WHAT THIS DOES
-- Converges the live database back onto the policy set defined in 0001, 0002,
-- 0005 and 0009. Every table is dropped clean of policies first and then given
-- the intended ones, so the result is the same no matter what state the project
-- was in. Missing tables are skipped instead of aborting the run.
--
-- SAFE TO APPLY
-- Every server write path (/api/booking, /api/register, /api/admin/*) uses the
-- service role key, which bypasses RLS, so enabling it does not lock the forms
-- out. Reads that must stay public (schedule, class types, settings) keep their
-- public read policies below.
--
-- This migration is idempotent — running it twice changes nothing.

-- ---------------------------------------------------------------------------
-- 1. Helper functions (from 0002). SECURITY DEFINER, so policies can ask about
--    the caller's role without recursing back through the profiles policies.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_trainer()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'trainer')
  );
$$;

-- ---------------------------------------------------------------------------
-- 2. Turn row level security on, and clear whatever policies happen to be there.
--    Clearing first is what makes this converge: the safe direction for a
--    security fix is "too strict", and section 3 puts the intended ones back.
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  t     text;
  kind  "char";
  pol   record;
  tables text[] := ARRAY[
    'profiles', 'packages', 'children', 'subscriptions', 'subscription_freezes',
    'class_types', 'schedule_templates', 'schedule_exceptions', 'class_sessions',
    'enrollments', 'payments', 'waitlist', 'notifications', 'studio_settings',
    'audit_log', 'attendance', 'registrations', 'bookings', 'legacy_bookings',
    'site_content', 'chat_rooms', 'chat_participants', 'chat_messages',
    'admin_presence'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    IF to_regclass('public.' || quote_ident(t)) IS NULL THEN
      RAISE NOTICE 'skipping %, relation does not exist', t;
      CONTINUE;
    END IF;

    SELECT c.relkind INTO kind
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = t;

    -- A view cannot carry row level security of its own. Making it run as the
    -- caller instead of as its owner is what closes the hole: the view then
    -- inherits whatever policies protect the table underneath. This is the fix
    -- for public.bookings.
    IF kind = 'v' THEN
      EXECUTE format('ALTER VIEW public.%I SET (security_invoker = on)', t);
      RAISE NOTICE '% is a view -> security_invoker enabled', t;
      CONTINUE;
    END IF;

    IF kind NOT IN ('r', 'p') THEN
      RAISE NOTICE 'skipping %, relkind % is neither table nor view', t, kind;
      CONTINUE;
    END IF;

    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);

    FOR pol IN
      SELECT policyname FROM pg_policies
      WHERE schemaname = 'public' AND tablename = t
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, t);
    END LOOP;
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 3. The intended policies.
--    Guarded per table so a partially migrated project still gets everything
--    it can. Tables absent from the project are skipped silently.
-- ---------------------------------------------------------------------------

DO $$
BEGIN

-- profiles: a person sees their own row; admins see all.
IF to_regclass('public.profiles') IS NOT NULL THEN
  CREATE POLICY "profiles_own"   ON public.profiles FOR ALL USING (auth.uid() = id);
  CREATE POLICY "profiles_admin" ON public.profiles FOR ALL USING (public.is_admin());
END IF;

-- packages: public price list, admin writes.
IF to_regclass('public.packages') IS NOT NULL THEN
  CREATE POLICY "public_read_packages"   ON public.packages FOR SELECT USING (true);
  CREATE POLICY "admin_manage_packages"  ON public.packages FOR ALL USING (public.is_admin());
END IF;

-- children: parents and staff only. Never public.
IF to_regclass('public.children') IS NOT NULL THEN
  CREATE POLICY "parents_own_children" ON public.children FOR ALL USING (parent_id = auth.uid());
  CREATE POLICY "admin_all_children"   ON public.children FOR ALL USING (public.is_admin_or_trainer());
END IF;

IF to_regclass('public.subscriptions') IS NOT NULL THEN
  CREATE POLICY "subscriptions_own"   ON public.subscriptions FOR ALL USING (auth.uid() = user_id);
  CREATE POLICY "subscriptions_admin" ON public.subscriptions FOR ALL USING (public.is_admin());
END IF;

IF to_regclass('public.subscription_freezes') IS NOT NULL THEN
  CREATE POLICY "users_own_freezes" ON public.subscription_freezes FOR SELECT
    USING (subscription_id IN (SELECT id FROM public.subscriptions WHERE user_id = auth.uid()));
  CREATE POLICY "admin_manage_freezes" ON public.subscription_freezes FOR ALL USING (public.is_admin());
END IF;

-- The schedule is meant to be readable by visitors — that is the public
-- timetable on /schedule. Writes stay with staff.
IF to_regclass('public.class_types') IS NOT NULL THEN
  CREATE POLICY "public_read_class_types"   ON public.class_types FOR SELECT USING (true);
  CREATE POLICY "admin_manage_class_types"  ON public.class_types FOR ALL USING (public.is_admin());
END IF;

IF to_regclass('public.schedule_templates') IS NOT NULL THEN
  CREATE POLICY "public_read_templates"  ON public.schedule_templates FOR SELECT USING (true);
  CREATE POLICY "admin_manage_templates" ON public.schedule_templates FOR ALL USING (public.is_admin());
END IF;

IF to_regclass('public.schedule_exceptions') IS NOT NULL THEN
  CREATE POLICY "public_read_exceptions"  ON public.schedule_exceptions FOR SELECT USING (true);
  CREATE POLICY "admin_manage_exceptions" ON public.schedule_exceptions FOR ALL USING (public.is_admin());
END IF;

IF to_regclass('public.class_sessions') IS NOT NULL THEN
  CREATE POLICY "public_read_sessions"   ON public.class_sessions FOR SELECT USING (true);
  CREATE POLICY "admin_manage_sessions"  ON public.class_sessions FOR ALL USING (public.is_admin_or_trainer());
END IF;

IF to_regclass('public.enrollments') IS NOT NULL THEN
  CREATE POLICY "users_own_enrollments" ON public.enrollments FOR ALL USING (user_id = auth.uid());
  CREATE POLICY "admin_all_enrollments" ON public.enrollments FOR ALL USING (public.is_admin_or_trainer());
END IF;

IF to_regclass('public.payments') IS NOT NULL THEN
  CREATE POLICY "users_own_payments"   ON public.payments FOR SELECT USING (user_id = auth.uid());
  CREATE POLICY "admin_manage_payments" ON public.payments FOR ALL USING (public.is_admin());
END IF;

IF to_regclass('public.waitlist') IS NOT NULL THEN
  CREATE POLICY "users_own_waitlist"   ON public.waitlist FOR ALL USING (user_id = auth.uid());
  CREATE POLICY "admin_manage_waitlist" ON public.waitlist FOR ALL USING (public.is_admin());
END IF;

IF to_regclass('public.notifications') IS NOT NULL THEN
  CREATE POLICY "users_own_notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
  CREATE POLICY "users_mark_read"         ON public.notifications FOR UPDATE
    USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  CREATE POLICY "admin_manage_notifications" ON public.notifications FOR ALL USING (public.is_admin());
END IF;

IF to_regclass('public.studio_settings') IS NOT NULL THEN
  CREATE POLICY "public_read_settings"   ON public.studio_settings FOR SELECT USING (true);
  CREATE POLICY "admin_manage_settings"  ON public.studio_settings FOR ALL USING (public.is_admin());
END IF;

IF to_regclass('public.audit_log') IS NOT NULL THEN
  CREATE POLICY "admin_read_audit" ON public.audit_log FOR SELECT USING (public.is_admin());
END IF;

IF to_regclass('public.attendance') IS NOT NULL THEN
  CREATE POLICY "admin_manage_attendance" ON public.attendance FOR ALL USING (public.is_admin_or_trainer());
END IF;

-- Registrations and bookings hold parent and child names, phone numbers and
-- consent records. Staff only. The public forms reach them through the server
-- routes, which use the service role key and are not subject to these policies,
-- so there is deliberately no anonymous INSERT policy here — that also removes
-- a way to write straight into the table and skip the rate limiter.
IF to_regclass('public.registrations') IS NOT NULL THEN
  CREATE POLICY "admin_all_registrations" ON public.registrations FOR ALL USING (public.is_admin_or_trainer());
END IF;

-- public.bookings is a view, so it gets security_invoker in section 2 and no
-- policies of its own. Policies belong on the table it reads from. The guard is
-- here in case the project ever has bookings as a real table again.
IF EXISTS (
  SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relname = 'bookings' AND c.relkind IN ('r','p')
) THEN
  CREATE POLICY "bookings_user_own" ON public.bookings FOR SELECT
    USING (user_id IS NOT NULL AND auth.uid() = user_id);
  CREATE POLICY "bookings_admin"    ON public.bookings FOR ALL USING (public.is_admin_or_trainer());
END IF;

IF to_regclass('public.legacy_bookings') IS NOT NULL THEN
  CREATE POLICY "legacy_bookings_user_own" ON public.legacy_bookings FOR SELECT
    USING (user_id IS NOT NULL AND auth.uid() = user_id);
  CREATE POLICY "legacy_bookings_admin" ON public.legacy_bookings FOR ALL
    USING (public.is_admin_or_trainer());
END IF;

IF to_regclass('public.site_content') IS NOT NULL THEN
  CREATE POLICY "public_read_site_content"  ON public.site_content FOR SELECT USING (true);
  CREATE POLICY "admin_manage_site_content" ON public.site_content FOR ALL USING (public.is_admin());
END IF;

END $$;

-- ---------------------------------------------------------------------------
-- 4. Verification. Run this afterwards; every row must read rls_enabled = true.
--
--   SELECT c.relname AS table_name,
--          c.relrowsecurity AS rls_enabled,
--          count(p.policyname) AS policies
--   FROM pg_class c
--   JOIN pg_namespace n ON n.oid = c.relnamespace
--   LEFT JOIN pg_policies p ON p.schemaname = 'public' AND p.tablename = c.relname
--   WHERE n.nspname = 'public' AND c.relkind = 'r'
--   GROUP BY 1, 2
--   ORDER BY c.relrowsecurity, 1;
-- ---------------------------------------------------------------------------
