-- Migrasjon: Legger til enum vanskelighetsgrad, sesong, terreng,
-- samt short_description, long_description (erstatter description), og sted.
-- Kjør etter tours.sql.

-- Enum: vanskelighetsgrad (nybegynner, intermediær, erfaren, ekspert)
create type public.vanskelighetsgrad as enum (
  'nybegynner',
  'intermediær',
  'erfaren',
  'ekspert'
);

-- Enum: sesong (sommer, vinter)
create type public.sesong as enum (
  'sommer',
  'vinter'
);

-- Enum: terreng (asfalt, grus, blandet)
create type public.terreng as enum (
  'asfalt',
  'grus',
  'blandet'
);

-- Legg til nye kolonner før vi fjerner description
alter table public.tours
  add column short_description text,
  add column long_description text,
  add column sted text,
  add column vanskelighetsgrad public.vanskelighetsgrad,
  add column sesong public.sesong,
  add column terreng public.terreng;

-- Flytt eksisterende description til long_description
update public.tours
set long_description = description
where description is not null;

-- Fjern gamle description-kolonnen
alter table public.tours
  drop column description;
