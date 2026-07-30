-- 0009_registrations.sql
-- KVKK-compliant public registration ("Anmeldeformular"): a parent/guardian
-- entrusts a child to the studio for painting, crafts or chess. Captures parent
-- + child master data (Stammdaten), a WhatsApp number, and explicit consents.
--
-- NOTE: consent wording should get a final review by a Turkish lawyer. The
-- structure below (separate, versioned, timestamped consents) is what KVKK and
-- a supervision/liability handover typically require.

CREATE TABLE IF NOT EXISTS registrations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    timestamptz NOT NULL DEFAULT now(),

  -- Parent / guardian (Veli) master data
  parent_name         text NOT NULL,
  parent_id_no        text,            -- T.C. Kimlik No, or passport no. for foreigners
  parent_relationship text CHECK (parent_relationship IN ('mother', 'father', 'guardian')),
  parent_email        text,
  parent_phone        text NOT NULL,   -- WhatsApp number
  parent_address      text,

  -- Child (Çocuk)
  child_name          text NOT NULL,
  child_birth_date    date,
  child_gender        text CHECK (child_gender IN ('male', 'female', 'other')),
  child_health_notes  text,
  emergency_contact   text,

  -- Enrollment interest
  branch              text NOT NULL CHECK (branch IN ('painting', 'chess', 'crafts', 'individual')),
  package_id          text,            -- e.g. 'pack8'
  preferred_language  text NOT NULL DEFAULT 'tr' CHECK (preferred_language IN ('tr', 'en', 'ru')),
  message             text,

  -- KVKK / consent record (audit trail)
  consent_kvkk        boolean NOT NULL DEFAULT false CHECK (consent_kvkk),
  consent_liability   boolean NOT NULL DEFAULT false CHECK (consent_liability),
  consent_media       boolean NOT NULL DEFAULT false,   -- photo/video use (optional)
  consent_version     text    NOT NULL DEFAULT '2026-07-v1',
  consented_at        timestamptz,
  consent_ip          text,

  status              text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'enrolled', 'archived'))
);

CREATE INDEX IF NOT EXISTS idx_registrations_created ON registrations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_registrations_status  ON registrations(status);

ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Reads are admin/trainer only; public inserts happen server-side via the
-- service-role key (which bypasses RLS), same pattern as /api/booking.
DROP POLICY IF EXISTS "admin_all_registrations" ON registrations;
CREATE POLICY "admin_all_registrations" ON registrations
  FOR ALL USING (public.is_admin_or_trainer());
