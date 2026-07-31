-- 0014 — audit_log.actor_id must tolerate the shared admin login
--
-- Same root cause as 0013: actions taken through the ADMIN_DASHBOARD_USER cookie
-- have no Supabase user, so requireAdmin() yields the sentinel "legacy-admin".
-- audit_log.actor_id is NOT NULL REFERENCES profiles(id), so those writes raised
-- `invalid input syntax for type uuid` and were swallowed by logAuditEntry's
-- catch-and-log — an audit trail that silently recorded nothing.
--
-- Dropping NOT NULL lets the action be recorded with an explicitly unknown
-- actor, which is strictly better than losing the entry. Actions by a real
-- Supabase admin still carry their id.

ALTER TABLE public.audit_log
  ALTER COLUMN actor_id DROP NOT NULL;

COMMENT ON COLUMN public.audit_log.actor_id IS
  'Supabase user who performed the action. NULL when performed through the shared ADMIN_DASHBOARD_USER cookie login, which has no profiles row.';
