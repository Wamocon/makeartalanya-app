-- Separate the KVKK notice acknowledgment from explicit consent, and record
-- service pre-information independently. Existing consent_* columns remain as
-- compatibility mirrors for the current admin UI and historical rows.

ALTER TABLE IF EXISTS public.registrations
  ADD COLUMN IF NOT EXISTS privacy_notice_ack boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS privacy_notice_version text,
  ADD COLUMN IF NOT EXISTS terms_ack boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS terms_version text,
  ADD COLUMN IF NOT EXISTS consent_health boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.registrations.privacy_notice_ack IS
  'Evidence that the Art. 10 KVKK notice was presented and acknowledged; not explicit consent.';
COMMENT ON COLUMN public.registrations.consent_health IS
  'Separate optional guardian consent for child health/allergy notes (special-category data).';
COMMENT ON COLUMN public.registrations.terms_ack IS
  'Acknowledgment of the non-binding request and pre-contract/service information.';

ALTER TABLE IF EXISTS public.legacy_bookings
  ADD COLUMN IF NOT EXISTS privacy_notice_ack boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS privacy_notice_version text,
  ADD COLUMN IF NOT EXISTS terms_ack boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS terms_version text;

COMMENT ON COLUMN public.legacy_bookings.privacy_notice_ack IS
  'Evidence that the KVKK notice was presented; not explicit consent.';
COMMENT ON COLUMN public.legacy_bookings.terms_ack IS
  'Acknowledgment of the non-binding request and service pre-information.';
