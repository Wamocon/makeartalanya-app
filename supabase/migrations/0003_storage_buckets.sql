-- Create public storage buckets for gallery images and instructor photo
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('gallery', 'gallery', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('instructor', 'instructor', true, 10485760, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public read policy for gallery bucket
CREATE POLICY "Public read gallery" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallery');

-- Public read policy for instructor bucket
CREATE POLICY "Public read instructor" ON storage.objects
  FOR SELECT USING (bucket_id = 'instructor');
