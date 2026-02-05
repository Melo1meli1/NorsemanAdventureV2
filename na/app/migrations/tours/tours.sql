create type tour_status as enum ('draft', 'published');

create table public.tours (
  id uuid primary key default gen_random_uuid(),

  title text not null,
  description text,
  price numeric(10, 2) not null,

  start_date timestamptz not null,
  end_date timestamptz not null,

  seats_available integer not null,
  total_seats integer not null default 10,
  image_url text,

  status tour_status not null default 'draft',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_tours_updated_at
before update on public.tours
for each row
execute function public.set_current_timestamp_updated_at();

