-- 0012 — Storage access policies + remaining schema drift
--
-- Closes the last gaps found by auditing the live project against 0001–0011.
-- Additive only: no drops, no data changes.

-- ═══════════════════════════════════════════════════════════════════
-- 1. Storage buckets
--    0003 declared the buckets and their public-read policies, but was never
--    applied. The buckets exist (created by hand or by the upload route), the
--    policies do not.
--
--    Why this matters: storage.objects has RLS enabled with zero policies. The
--    landing page lists bucket contents from the BROWSER with the publishable
--    key —
--        POST /storage/v1/object/list/gallery
--    — and that path is subject to RLS, so it returned [] and the gallery fell
--    back to the bundled placeholder images. Eleven uploaded photos were
--    invisible on the live site.
--
--    Note /object/public/<bucket>/<file> is NOT affected (public buckets serve
--    those straight from the CDN), which is why the content-override JSON that
--    page.tsx fetches has always worked. It is specifically LIST that needs a
--    SELECT policy.
--
--    Writes are deliberately not covered: uploads and deletes go through
--    /api/upload with the service-role key, which bypasses RLS. Granting
--    anonymous INSERT here would let anyone write into the buckets.
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('gallery',    'gallery',    true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('instructor', 'instructor', true, 10485760, ARRAY['image/jpeg','image/png','image/webp']),
  ('content',    'content',    true,  5242880, ARRAY['application/json'])
ON CONFLICT (id) DO UPDATE SET
  public            = EXCLUDED.public,
  file_size_limit   = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DO $$
DECLARE
  b text;
  pol_name text;
BEGIN
  FOREACH b IN ARRAY ARRAY['gallery','instructor','content'] LOOP
    pol_name := 'Public read ' || b;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policy
      WHERE polrelid = 'storage.objects'::regclass AND polname = pol_name
    ) THEN
      EXECUTE format(
        'CREATE POLICY %I ON storage.objects FOR SELECT USING (bucket_id = %L)',
        pol_name, b
      );
    END IF;
  END LOOP;
END $$;

-- ═══════════════════════════════════════════════════════════════════
-- 2. Missing index from 0005
--    idx_sessions_trainer backs the /trainer dashboard query
--    (trainer_id + starts_at range). Everything else in 0001–0011 is present.
-- ═══════════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_sessions_trainer
  ON public.class_sessions(trainer_id, starts_at);
