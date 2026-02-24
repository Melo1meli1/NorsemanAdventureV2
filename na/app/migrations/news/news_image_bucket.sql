-- news-images bucket: public bucket for news images.
-- Allowed MIME types: image/jpeg, image/png, image/webp (WebP used after client-side compression).
-- If INSERT into storage.buckets fails (e.g. schema read-only), create the bucket in Supabase Dashboard:
--   Name: news-images, Public: on, Allowed MIME types: image/jpeg, image/png, image/webp

insert into storage.buckets (id, name, public, allowed_mime_types)
values (
  'news-images',
  'news-images',
  true,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  allowed_mime_types = excluded.allowed_mime_types;

-- RLS: public read, authenticated (admin) write

drop policy if exists "Public read news-images" on storage.objects;
create policy "Public read news-images"
on storage.objects for select
using ( bucket_id = 'news-images' );

drop policy if exists "Admin insert news-images" on storage.objects;
create policy "Admin insert news-images"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'news-images' );

drop policy if exists "Admin update news-images" on storage.objects;
create policy "Admin update news-images"
on storage.objects for update
to authenticated
using ( bucket_id = 'news-images' )
with check ( bucket_id = 'news-images' );

drop policy if exists "Admin delete news-images" on storage.objects;
create policy "Admin delete news-images"
on storage.objects for delete
to authenticated
using ( bucket_id = 'news-images' );