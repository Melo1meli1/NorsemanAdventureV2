-- Offentlig galleri: bilder som vises på den offentlige galleri-siden.
-- Enten knyttet til en tur (tour_id satt) eller galleri-only (tour_id null).
-- Kjør etter at public.tours finnes.

create table public.public_gallery_images (
  id uuid primary key default gen_random_uuid(),
  tour_id uuid references public.tours(id) on delete cascade,
  file_path text not null,
  created_at timestamptz not null default now(),
  constraint public_gallery_images_file_path_key unique (file_path)
);

create index if not exists public_gallery_images_tour_id_idx
  on public.public_gallery_images(tour_id);

comment on table public.public_gallery_images is
  'Bilder som vises på offentlig galleri. file_path er sti i bucket tours-gallery (f.eks. tour_id/fil.webp eller _gallery/fil.webp).';
