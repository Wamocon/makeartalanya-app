-- 0027 — Categories become data
--
-- 0024 deliberately left the four categories in code: their slugs are public
-- URL fragments and their labels are translated three ways, so a text input that
-- could rename a slug looked like a way to break links. That reasoning protected
-- the wrong person. The studio runs a new workshop series or a second camp
-- season and cannot add a rail for it without a developer, which is exactly the
-- bottleneck this whole feature set exists to remove.
--
-- The links stay safe by making the slug immutable instead of absent: it is
-- generated once from the first label and never editable afterwards. Renaming
-- the label — the thing visitors actually read — stays free.

CREATE TABLE IF NOT EXISTS public.gallery_categories (
  -- Slug is the primary key and never changes. gallery_items.category points at
  -- it, so a rename would have to cascade through every photo; a label edit
  -- touches one row.
  slug        text PRIMARY KEY CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),

  -- {"tr": "...", "en": "...", "ru": "..."} — the rail heading on the website.
  label       jsonb NOT NULL,

  -- Order of the rails down the gallery section.
  position    integer NOT NULL DEFAULT 0,

  -- A category with nothing in it, or one being prepared, should not put an
  -- empty heading on the landing page.
  visible     boolean NOT NULL DEFAULT true,

  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),

  -- Every locale must be present and non-empty. A rail whose heading is blank in
  -- Russian is a broken page for a third of this studio's families, and the
  -- admin form is the only place that can reasonably be made to care.
  CONSTRAINT gallery_categories_label_complete CHECK (
    label ? 'tr' AND label ? 'en' AND label ? 'ru'
    AND length(trim(label->>'tr')) > 0
    AND length(trim(label->>'en')) > 0
    AND length(trim(label->>'ru')) > 0
  )
);

CREATE INDEX IF NOT EXISTS idx_gallery_categories_position
  ON public.gallery_categories(position);

DROP TRIGGER IF EXISTS trg_gallery_categories_touch ON public.gallery_categories;
CREATE TRIGGER trg_gallery_categories_touch
  BEFORE UPDATE ON public.gallery_categories
  FOR EACH ROW EXECUTE FUNCTION public.fn_gallery_items_touch();

-- Seed from what the code already defines, in the order the site renders today.
-- Importing must not visibly change the gallery.
INSERT INTO public.gallery_categories (slug, label, position) VALUES
  ('lessons',    '{"tr":"Yaratıcılık Dersleri","en":"Creative Lessons","ru":"Творческие занятия"}'::jsonb, 1),
  ('camp',       '{"tr":"Sanat Kampı","en":"Summer Art Camp","ru":"Летний арт-лагерь"}'::jsonb,            2),
  ('individual', '{"tr":"Birebir Atölye","en":"One-to-One Studio","ru":"Индивидуально"}'::jsonb,           3),
  ('workshops',  '{"tr":"Usta Atölyeleri","en":"Master Classes","ru":"Мастер-классы"}'::jsonb,             4)
ON CONFLICT (slug) DO NOTHING;

-- Now that every existing category exists as a row, the reference can be real.
-- RESTRICT rather than CASCADE: deleting a category must never silently delete
-- the photos in it. The admin is asked to move them first, which is recoverable;
-- a cascade is forty photos gone on one click.
ALTER TABLE public.gallery_items
  DROP CONSTRAINT IF EXISTS gallery_items_category_fkey;
ALTER TABLE public.gallery_items
  ADD CONSTRAINT gallery_items_category_fkey
  FOREIGN KEY (category) REFERENCES public.gallery_categories(slug)
  ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE public.gallery_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_visible_categories" ON public.gallery_categories;
CREATE POLICY "public_read_visible_categories" ON public.gallery_categories
  FOR SELECT USING (visible);

DROP POLICY IF EXISTS "admin_read_all_categories" ON public.gallery_categories;
CREATE POLICY "admin_read_all_categories" ON public.gallery_categories
  FOR SELECT USING (public.is_admin_or_trainer());

COMMENT ON TABLE public.gallery_categories IS
  'Rails of the public gallery. Slug is immutable and public; label is the translated heading and is freely editable.';
COMMENT ON COLUMN public.gallery_categories.slug IS
  'Immutable. Generated from the first label on creation. gallery_items.category references it.';

-- Reorder helper, same shape and same reasoning as fn_gallery_reorder.
CREATE OR REPLACE FUNCTION public.fn_gallery_categories_reorder(p_slugs text[])
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  n integer;
BEGIN
  UPDATE public.gallery_categories c
     SET position = o.ord
    FROM unnest(p_slugs) WITH ORDINALITY AS o(slug, ord)
   WHERE c.slug = o.slug;
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END;
$$;

REVOKE ALL ON FUNCTION public.fn_gallery_categories_reorder(text[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fn_gallery_categories_reorder(text[]) FROM anon;
REVOKE ALL ON FUNCTION public.fn_gallery_categories_reorder(text[]) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.fn_gallery_categories_reorder(text[]) TO service_role;
