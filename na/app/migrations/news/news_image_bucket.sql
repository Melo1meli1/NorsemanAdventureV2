-- Opprett bucket 
-- Sett public access for bucket

-- RLS policies (tilpass etter behov)
CREATE POLICY "Anyone can view news images" ON storage.objects 
FOR SELECT USING (bucket_id = 'news-images');

CREATE POLICY "Authenticated users can upload news images" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'news-images' AND 
  auth.role() = 'authenticated'
);