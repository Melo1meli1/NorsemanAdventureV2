-- tours-gallery bucket: public bucket for tour images.
-- Allowed MIME types: image/jpeg, image/png, image/webp (WebP used after client-side compression).
-- If INSERT into storage.buckets fails (e.g. schema read-only), create the bucket in Supabase Dashboard:
--   Name: tours-gallery, Public: on, Allowed MIME types: image/jpeg, image/png, image/webp

insert into storage.buckets (id, name, public, allowed_mime_types)
values (
  'tours-gallery',
  'tours-gallery',
  true,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  allowed_mime_types = excluded.allowed_mime_types;

-- Verify MIME types (run in SQL Editor after migration):
--   select allowed_mime_types from storage.buckets where id = 'tours-gallery';
-- Expected: {image/jpeg,image/png,image/webp}

-- RLS: public read, authenticated (admin) write

drop policy if exists "Public read tours-gallery" on storage.objects;
create policy "Public read tours-gallery"
on storage.objects for select
using ( bucket_id = 'tours-gallery' );

drop policy if exists "Admin insert tours-gallery" on storage.objects;
create policy "Admin insert tours-gallery"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'tours-gallery' );

drop policy if exists "Admin update tours-gallery" on storage.objects;
create policy "Admin update tours-gallery"
on storage.objects for update
to authenticated
using ( bucket_id = 'tours-gallery' )
with check ( bucket_id = 'tours-gallery' );

drop policy if exists "Admin delete tours-gallery" on storage.objects;
create policy "Admin delete tours-gallery"
on storage.objects for delete
to authenticated
using ( bucket_id = 'tours-gallery' );
