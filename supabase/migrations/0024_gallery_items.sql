-- 0024 — The gallery becomes editable
--
-- Until now the gallery was a build artefact: scripts/build-gallery.mjs walked
-- source-photos/, wrote 160 WebP pairs into public/gallery/ and baked the list
-- into src/data/gallery.ts. Adding one photo meant a checkout, a script run and
-- a deploy. Meanwhile /admin/media happily uploaded into the `gallery` bucket
-- and nothing on the site ever read it, so every upload vanished silently.
--
-- This table is the manifest. It holds the ORDER, the grouping and the copy;
-- the pixels stay wherever they already live. That distinction is the whole
-- design:
--
--   * The 160 bundled photos are imported as rows whose src/thumb point at
--     /gallery/... — served from the Vercel CDN exactly as before. No re-upload,
--     no Supabase egress, and the pre-computed blur placeholders survive.
--   * Anything uploaded from now on carries storage_bucket + storage_path and
--     is served from Supabase Storage.
--
-- Both kinds are otherwise identical, so the admin reorders, retitles, hides and
-- deletes all 160 legacy photos alongside new ones without knowing the
-- difference. storage_path being NULL is exactly what tells the delete route
-- "row only, there is no object to remove".

CREATE TABLE IF NOT EXISTS public.gallery_items (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  kind           text NOT NULL DEFAULT 'photo' CHECK (kind IN ('photo', 'video')),

  -- Category and group slugs match src/data/gallery.ts. They stay code-defined
  -- rather than becoming their own table: the slugs are public URLs and the
  -- labels are translated into three languages, so both belong with the rest of
  -- the i18n rather than in a text field someone can rename into a broken link.
  category       text NOT NULL,
  "group"        text,

  -- src is the lightbox asset (or the video file); thumb is what the rail shows.
  -- For video, thumb is the poster frame, so a rail can render either kind with
  -- the same <Image> and only reach for <video> once the lightbox opens.
  src            text NOT NULL,
  thumb          text NOT NULL,
  blur           text,

  -- Baked in so the rail can size a tile before the image arrives. The rails
  -- derive tile width from aspect ratio; without these the whole section reflows
  -- as photos land, which is precisely the jank build-gallery.mjs avoided.
  width          integer NOT NULL CHECK (width  > 0),
  height         integer NOT NULL CHECK (height > 0),

  -- Per-locale copy: {"tr": "...", "en": "...", "ru": "..."}. jsonb rather than
  -- three columns because a missing translation is the normal case here — the
  -- studio writes Russian first and fills the rest in later, if ever.
  caption        jsonb NOT NULL DEFAULT '{}'::jsonb,
  alt            jsonb NOT NULL DEFAULT '{}'::jsonb,

  -- Dense 1..n within a category, rewritten wholesale by the reorder endpoint.
  -- Fractional indexing would spare us the bulk update, but with ~70 rows in the
  -- largest category a single statement is cheaper than carrying the rebalancing
  -- edge cases that fractional positions eventually force on you.
  position       integer NOT NULL DEFAULT 0,

  -- Hidden items stay in the admin grid and vanish from the site. Deleting a
  -- photo is destructive and irreversible; hiding is the reversible move, and
  -- most "remove this" intentions are really "not right now".
  visible        boolean NOT NULL DEFAULT true,

  -- NULL for the bundled archive. Set for anything uploaded through the admin.
  storage_bucket text,
  storage_path   text,

  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),

  -- A storage-backed row needs both halves to be deletable; a bundled row needs
  -- neither. One set and not the other is a leak waiting to happen.
  CONSTRAINT gallery_items_storage_pair CHECK (
    (storage_bucket IS NULL AND storage_path IS NULL) OR
    (storage_bucket IS NOT NULL AND storage_path IS NOT NULL)
  )
);

-- The public read path is "visible items of one category, in order" — one index
-- covers it and the admin's per-category grid at the same time.
CREATE INDEX IF NOT EXISTS idx_gallery_items_category_position
  ON public.gallery_items(category, position);

CREATE INDEX IF NOT EXISTS idx_gallery_items_visible
  ON public.gallery_items(visible) WHERE visible;

-- Re-importing the bundled archive must not duplicate it. The path is the
-- natural key for those rows, and a partial unique index leaves storage-backed
-- rows (whose src is a full Supabase URL, always unique anyway) alone.
CREATE UNIQUE INDEX IF NOT EXISTS idx_gallery_items_bundled_src
  ON public.gallery_items(src) WHERE storage_path IS NULL;

CREATE OR REPLACE FUNCTION public.fn_gallery_items_touch()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_gallery_items_touch ON public.gallery_items;
CREATE TRIGGER trg_gallery_items_touch
  BEFORE UPDATE ON public.gallery_items
  FOR EACH ROW EXECUTE FUNCTION public.fn_gallery_items_touch();

ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

-- Anonymous visitors read the visible rows and nothing else. Every write goes
-- through /api/admin/gallery/* with the service role, which bypasses RLS — the
-- same shape as the rest of this schema, and the reason there is no INSERT or
-- UPDATE policy here for anyone to find.
DROP POLICY IF EXISTS "public_read_visible_gallery" ON public.gallery_items;
CREATE POLICY "public_read_visible_gallery" ON public.gallery_items
  FOR SELECT USING (visible);

DROP POLICY IF EXISTS "admin_read_all_gallery" ON public.gallery_items;
CREATE POLICY "admin_read_all_gallery" ON public.gallery_items
  FOR SELECT USING (public.is_admin_or_trainer());

COMMENT ON TABLE public.gallery_items IS
  'Ordered manifest for the public gallery. Rows with storage_path point at Supabase Storage; rows without it point at the bundled archive under public/gallery/.';
COMMENT ON COLUMN public.gallery_items.position IS
  'Dense 1..n within a category. Rewritten wholesale by POST /api/admin/gallery/reorder.';
COMMENT ON COLUMN public.gallery_items.blur IS
  'Inline base64 WebP placeholder, ~16px wide. Avoids a network round-trip before first paint.';

-- ═══════════════════════════════════════════════════════════════════
-- Buckets
--
-- 0012 capped `gallery` at 10 MB and images only. Video needs headroom and two
-- more mime types. The 10 MB image cap stays effectively irrelevant now that the
-- browser downscales to ~300 KB before upload — it is a backstop against a
-- pathological file, not the working limit.
--
-- 50 MB is chosen to sit under Supabase's default and well above a 90-second
-- phone clip. Uploads go direct to Storage on a signed URL, so Vercel's ~4.5 MB
-- serverless request body limit never enters the picture.
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery', 'gallery', true, 52428800,
  ARRAY['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm']
)
ON CONFLICT (id) DO UPDATE SET
  public             = EXCLUDED.public,
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
