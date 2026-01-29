-- Migrasjon: Legger til kolonne høydepunkter (kommaseparerte ord).
-- Kjør etter tours_add_enums_and_fields.sql.

alter table public.tours
  add column hoydepunkter text;
