-- Record optional media permission separately for the studio website and its
-- official social-media accounts. This keeps each explicit consent specific,
-- freely selectable and independently withdrawable under KVKK.

ALTER TABLE IF EXISTS public.registrations
  ADD COLUMN IF NOT EXISTS consent_media_website boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_media_social boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS media_consent_version text,
  ADD COLUMN IF NOT EXISTS media_consented_at timestamptz,
  ADD COLUMN IF NOT EXISTS media_consent_ip inet;

COMMENT ON COLUMN public.registrations.consent_media_website IS
  'Optional guardian explicit consent for written testimonials, photos, audio and video on the studio website.';
COMMENT ON COLUMN public.registrations.consent_media_social IS
  'Optional guardian explicit consent for written testimonials, photos, audio and video on official social-media accounts.';
COMMENT ON COLUMN public.registrations.media_consent_version IS
  'Version of the separate media-consent wording shown to the guardian.';
COMMENT ON COLUMN public.registrations.media_consented_at IS
  'Time at which at least one optional media channel was actively selected.';
COMMENT ON COLUMN public.registrations.media_consent_ip IS
  'Security/evidence IP recorded only when at least one media channel was selected.';
