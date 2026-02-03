-- Migrasjon: Legg til total_seats (maks kapasitet) på tours.
-- seats_available = ledige plasser; total_seats = totalt antall plasser.
-- Antall påmeldte = total_seats - seats_available.
-- Kjør etter tours.sql (og øvrige tours-migrasjoner).

alter table public.tours
  add column if not exists total_seats integer not null default 10;

-- Eksisterende rader: sett total_seats = seats_available (antatt at ingen har booket ennå)
update public.tours
set total_seats = seats_available;

-- Sikre at total_seats alltid er >= seats_available (constraint valgfritt)
-- alter table public.tours add constraint tours_total_seats_gte_available
--   check (total_seats >= seats_available);
