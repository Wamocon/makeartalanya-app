-- Record versioned KVKK consent for the lightweight homepage booking form.
-- Historical rows remain false/null; new writes are validated by /api/booking.

ALTER TABLE IF EXISTS public.legacy_bookings
  ADD COLUMN IF NOT EXISTS consent_kvkk boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_version text,
  ADD COLUMN IF NOT EXISTS consented_at timestamptz,
  ADD COLUMN IF NOT EXISTS consent_ip text;
