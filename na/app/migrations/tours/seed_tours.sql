-- Seed: 4 eksempel-turer for utvikling/testing
-- Kjør etter tours.sql og rls.sql (migrasjoner kjører som db-owner, så INSERT er tillatt)

insert into public.tours (
  title,
  description,
  price,
  start_date,
  end_date,
  seats_available,
  image_url,
  status
) values
  (
    'Lofoten – midnattsol og fjell',
    'En ukes tur i Lofoten med fokus på fotografering, fjellvandring og opplevelse av midnattsol. Inkluderer overnatting i rorbu.',
    8990.00,
    '2026-06-15 10:00:00+02',
    '2026-06-22 14:00:00+02',
    12,
    null,
    'published'
  ),
  (
    'Geiranger og Nærøyfjorden',
    'Kombinasjonstur med båt på Geirangerfjorden og Nærøyfjorden, med overnatting i fjellstuer og guidet vandring.',
    7490.00,
    '2026-07-01 09:00:00+02',
    '2026-07-05 16:00:00+02',
    16,
    null,
    'published'
  ),
  (
    'Nordkapp og Finnmark',
    'Reise til Nordkapp med besøk i Honningsvåg, Samiske opplevelser og mulighet for midnattsol og nordlys avhengig av sesong.',
    12990.00,
    '2026-08-10 08:00:00+02',
    '2026-08-17 18:00:00+02',
    8,
    null,
    'draft'
  ),
  (
    'Bergen og Vestlandsfjordene',
    'Kort helgetur fra Bergen med båttur på fjordene, Fløibanen og opplevelse av Bryggen og det historiske Bergen.',
    3990.00,
    '2026-09-12 11:00:00+02',
    '2026-09-14 15:00:00+02',
    20,
    null,
    'published'
  );
