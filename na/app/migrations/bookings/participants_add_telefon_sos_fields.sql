-- Legg til telefon for deltaker og navn/telefon for nødkontakt (SOS).
-- Kjør etter bookings_enums_and_tables.sql.

alter table public.participants add column if not exists telefon text;
alter table public.participants add column if not exists sos_navn text;
alter table public.participants add column if not exists sos_telefon text;

-- Fyll eksisterende rader (hvis noen) med tom streng før vi setter not null
update public.participants
set telefon = coalesce(telefon, ''),
    sos_navn = coalesce(sos_navn, ''),
    sos_telefon = coalesce(sos_telefon, '')
where telefon is null or sos_navn is null or sos_telefon is null;

alter table public.participants alter column telefon set not null;
alter table public.participants alter column sos_navn set not null;
alter table public.participants alter column sos_telefon set not null;

alter table public.participants drop column if exists sos;
