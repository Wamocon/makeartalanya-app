-- Content management table for editable site text
CREATE TABLE IF NOT EXISTS public.site_content (
  id TEXT PRIMARY KEY,  -- e.g. "hero.headline.tr", "about.headline.en"
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Public read (for the landing page)
CREATE POLICY "Anyone can read site content"
  ON public.site_content FOR SELECT
  USING (true);

-- Service role can write (admin only via API)
CREATE POLICY "Service role can manage content"
  ON public.site_content FOR ALL
  USING (auth.role() = 'service_role');
