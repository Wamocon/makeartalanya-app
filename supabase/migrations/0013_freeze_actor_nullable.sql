-- 0013 — subscription_freezes.created_by must tolerate the shared admin login
--
-- created_by is NOT NULL REFERENCES profiles(id), but /admin can also be reached
-- through the ADMIN_DASHBOARD_USER cookie, which has no Supabase user and no
-- profiles row — requireAdmin() returns the sentinel id "legacy-admin". Writing
-- that produced `invalid input syntax for type uuid`, so the freeze record was
-- never stored (the error was unchecked, so the subscription still flipped to
-- 'frozen' and unfreeze then matched nothing).
--
-- Making the column nullable records the truth: the action was taken through the
-- shared studio login and cannot be attributed to a person. Freezes made by a
-- real Supabase admin still carry their id.

ALTER TABLE public.subscription_freezes
  ALTER COLUMN created_by DROP NOT NULL;

COMMENT ON COLUMN public.subscription_freezes.created_by IS
  'Supabase user who froze the subscription. NULL when performed through the shared ADMIN_DASHBOARD_USER cookie login, which has no profiles row.';
