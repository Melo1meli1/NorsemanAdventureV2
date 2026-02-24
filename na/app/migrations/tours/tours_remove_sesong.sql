-- Migrasjon: Fjerner sesong enum og felt
-- Kjør etter tours_add_enums_and_fields.sql

-- Fjern sesong kolonnen
alter table public.tours
  drop column sesong;

-- Fjern sesong enum
drop type if exists public.sesong;
