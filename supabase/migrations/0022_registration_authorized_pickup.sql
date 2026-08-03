-- 0022 — Record who is allowed to collect the child after class
--
-- The signed participation agreement ("Кто может забирать ребенка" in the
-- participant questionnaire) asks for this, and clause 3.5 obliges the studio to
-- release a child only to those people. Without the answer stored next to the
-- registration, staff at the door have nothing to check against — so this is a
-- child-safeguarding field, not an administrative nicety.
--
-- Nullable on purpose: rows created before this migration cannot be backfilled,
-- and inventing a value for them would be worse than an empty field. New
-- submissions are required to fill it in at the application layer.

ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS authorized_pickup text;

COMMENT ON COLUMN public.registrations.authorized_pickup IS
  'People the parent/guardian authorises to collect the child after class (names, optionally relationship and phone). Required on new submissions; NULL only for rows created before migration 0022.';
