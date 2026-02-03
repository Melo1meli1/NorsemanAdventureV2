-- Bookings: enums og tabeller (bookings + participants).
-- Kjør etter at tours-tabellen finnes.
-- Type bestilling: tur per nå; senere merch, kurs.
-- Status: Betalt, Ikke betalt, Venteliste, Kansellert, Delvis betalt.

-- Enums (opprett først)
create type public.booking_type as enum ('tur');
-- Senere: alter type public.booking_type add value 'merch'; add value 'kurs';

create type public.booking_status as enum (
  'betalt',
  'ikke_betalt',
  'venteliste',
  'kansellert',
  'delvis_betalt'
);

-- Bookings-tabell
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  navn text not null,
  epost text not null,
  dato date not null,
  status public.booking_status not null,
  belop numeric(10, 2) not null,
  type public.booking_type not null default 'tur',
  tour_id uuid references public.tours(id) on delete set null,
  telefon text,
  notater text,
  created_at timestamptz not null default now()
);

-- Indeks for vanlige spørringer
create index if not exists bookings_tour_id_idx on public.bookings(tour_id);
create index if not exists bookings_dato_idx on public.bookings(dato);
create index if not exists bookings_status_idx on public.bookings(status);

-- Participants-tabell (én rad per deltaker per bestilling)
create table public.participants (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  name text not null,
  email text not null,
  sos text not null
);

create index if not exists participants_booking_id_idx on public.participants(booking_id);

-- Kommentarer for dokumentasjon
comment on table public.bookings is 'Hovedbestillinger (navn, epost, dato, status, beløp, type, hva de bestilte).';
comment on table public.participants is 'Deltakere per bestilling (navn, e-post, SOS/nødkontakt).';
