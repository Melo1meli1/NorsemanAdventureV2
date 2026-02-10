-- Seed-script for brukertest (MVP)
-- ------------------------------------------------------------
-- Dette skriptet:
--   1) Tømmer tours, bookings og participants
--   2) Legger inn 4 turer med "ekte" data
--   3) Legger inn bestillinger med alle statuser
--   4) Fyller opp deltakere slik at vi har:
--        - Én normal tur med god kapasitet
--        - Én tur som nesten er full (1 plass igjen)
--        - Én tur som er helt utsolgt (for venteliste)
--        - Én tur som er "draft" (kun i admin)
--
-- KJØRING:
--   - Kjør dette i Supabase SQL Editor eller lokalt via CLI
--   - Viktig: Kjør etter at alle migrasjoner for tours/bookings er kjørt
--
--   OBS: Dette er kun ment for utvikling / test. Ikke bruk i produksjon.

begin;

-- 1) Wipe eksisterende data (demo / utvikling)
truncate table public.participants restart identity cascade;
truncate table public.bookings restart identity cascade;
truncate table public.tours restart identity cascade;

-- 2) Opprett 4 turer
with
  -- Tur 1: Normal tur, god kapasitet
  t1 as (
    insert into public.tours (
      title,
      short_description,
      long_description,
      sted,
      vanskelighetsgrad,
      sesong,
      terreng,
      price,
      start_date,
      end_date,
      seats_available,
      total_seats,
      image_url,
      hoydepunkter,
      status
    )
    values (
      'Lofoten – midnattsol og fjell',
      'En ukestur i Lofoten med foto, fjell og midnattsol.',
      'En ukes tur i Lofoten med fokus på fotografering, fjellvandring og opplevelse av midnattsol. Inkluderer overnatting i rorbu og daglige turer med erfaren guide.',
      'Lofoten',
      'intermediær',
      'sommer',
      'blandet',
      8990.00,
      '2026-06-15 10:00:00+02',
      '2026-06-22 14:00:00+02',
      12,   -- 16 plasser totalt, 4 fylt opp (nedenfor)
      16,
      null, -- bruker terreng-basert fallback-bilde
      'Midnattsol, Topp-turer, Rorbuopphold, Fotostopp langs veien',
      'published'
    )
    returning id
  ),

  -- Tur 2: Nesten full – for å teste "få plasser igjen"
  t2 as (
    insert into public.tours (
      title,
      short_description,
      long_description,
      sted,
      vanskelighetsgrad,
      sesong,
      terreng,
      price,
      start_date,
      end_date,
      seats_available,
      total_seats,
      image_url,
      hoydepunkter,
      status
    )
    values (
      'Vestlandsfjorder – asfalt & hårnålssvinger',
      'Helgetur fra Bergen med ikoniske fjorder og svingete veier.',
      'En intensiv helgetur for motorsykkelentusiaster som vil oppleve vestlandsfjordene fra setet. Vi kjører via hårnålssvinger, fjelloverganger og små ferjekryssinger. Overnatting på fjellstue.',
      'Bergen / Sognefjorden',
      'erfaren',
      'sommer',
      'asfalt',
      4990.00,
      '2026-07-05 09:00:00+02',
      '2026-07-07 18:00:00+02',
      1,    -- 10 plasser totalt, 9 deltakere seedes nedenfor
      10,
      '/tour-asphalt.jpg',
      'Hårnålssvinger, Utsiktspunkter, Fjordcruise, Kaffe-stopp på fjellstue',
      'published'
    )
    returning id
  ),

  -- Tur 3: Helt utsolgt – for venteliste-scenario
  t3 as (
    insert into public.tours (
      title,
      short_description,
      long_description,
      sted,
      vanskelighetsgrad,
      sesong,
      terreng,
      price,
      start_date,
      end_date,
      seats_available,
      total_seats,
      image_url,
      hoydepunkter,
      status
    )
    values (
      'Nordkapp – langt mot nord',
      'Langtur til Nordkapp med fokus på utsikt og opplevelser.',
      'En klassisk langtursopplevelse via Helgelandskysten, Tromsø og til slutt Nordkapp-platået. Inkluderer flere netter på hotell og gjestehus, samt felles middager på utvalgte stopp.',
      'Nordkapp / Finnmark',
      'intermediær',
      'sommer',
      'blandet',
      12990.00,
      '2026-08-10 08:00:00+02',
      '2026-08-17 18:00:00+02',
      0,   -- Utsolgt (8 plasser totalt)
      8,
      '/tour-summer.jpg',
      'Nordkapp-platået, Midnattssol, Langetapper, Små kystsamfunn',
      'published'
    )
    returning id
  ),

  -- Tur 4: Draft – kun synlig i admin
  t4 as (
    insert into public.tours (
      title,
      short_description,
      long_description,
      sted,
      vanskelighetsgrad,
      sesong,
      terreng,
      price,
      start_date,
      end_date,
      seats_available,
      total_seats,
      image_url,
      hoydepunkter,
      status
    )
    values (
      'Vinterkurs – trygg kjøring på glatt føre',
      'Dagskurs på lukket område for å trene på nødbrems, balanse og kontroll på vinterføre.',
      'Et praktisk dagskurs med instruktør på lukket område. Vi øver på bremseteknikk, balanse, blikkbruk og kontroll på is- og snøføre. Passer for både ferske og erfarne førere som vil bli tryggere om vinteren.',
      'Oslo-området',
      'nybegynner',
      'vinter',
      'grus',
      1990.00,
      '2026-01-20 10:00:00+01',
      '2026-01-20 16:00:00+01',
      12,
      12,
      '/hero-motorcycle.jpg',
      'Nødbrems, Balanseøvelser, Svingteknikk, Instruktør-tilbakemelding',
      'draft'
    )
    returning id
  ),

  -- 3) Seed bookings med alle statuser
  b1 as (
    -- Tur 1: betalt booking med 2 deltakere
    insert into public.bookings (
      navn,
      epost,
      dato,
      status,
      belop,
      type,
      tour_id,
      telefon,
      notater
    )
    values (
      'Kari Nordmann',
      'kari.nordmann@example.com',
      current_date,
      'betalt',
      17980.00,
      'tur',
      (select id from t1),
      '+47 900 11 222',
      'To deltakere som deler rom.'
    )
    returning id
  ),
  b2 as (
    -- Tur 1: delvis betalt booking med 2 deltakere
    insert into public.bookings (
      navn,
      epost,
      dato,
      status,
      belop,
      type,
      tour_id,
      telefon,
      notater
    )
    values (
      'Ola Hansen',
      'ola.hansen@example.com',
      current_date,
      'delvis_betalt',
      8990.00,
      'tur',
      (select id from t1),
      '+47 901 23 456',
      'Betaler resten nærmere avreise.'
    )
    returning id
  ),
  b3 as (
    -- Tur 2: ikke betalt booking (gul rad i admin)
    insert into public.bookings (
      navn,
      epost,
      dato,
      status,
      belop,
      type,
      tour_id,
      telefon,
      notater
    )
    values (
      'Ingrid Solberg',
      'ingrid.solberg@example.com',
      current_date,
      'ikke_betalt',
      4990.00,
      'tur',
      (select id from t2),
      '+47 902 34 567',
      'Venter på svar fra samboer før betaling.'
    )
    returning id
  ),
  b4 as (
    -- Tur 2: betalt booking med 3 deltakere
    insert into public.bookings (
      navn,
      epost,
      dato,
      status,
      belop,
      type,
      tour_id,
      telefon,
      notater
    )
    values (
      'Per Johansen',
      'per.johansen@example.com',
      current_date,
      'betalt',
      14970.00,
      'tur',
      (select id from t2),
      '+47 903 45 678',
      'Kjører i gruppe, ønsker felles rom.'
    )
    returning id
  ),
  b5 as (
    -- Tur 2: kansellert booking
    insert into public.bookings (
      navn,
      epost,
      dato,
      status,
      belop,
      type,
      tour_id,
      telefon,
      notater
    )
    values (
      'Lene Andersen',
      'lene.andersen@example.com',
      current_date - interval '10 days',
      'kansellert',
      0.00,
      'tur',
      (select id from t2),
      '+47 904 56 789',
      'Måtte avlyse pga. skade. Ingen betaling gjennomført.'
    )
    returning id
  ),
  b6 as (
    -- Tur 2: betalt booking med 3 deltakere (for å komme opp i 9 deltakere totalt)
    insert into public.bookings (
      navn,
      epost,
      dato,
      status,
      belop,
      type,
      tour_id,
      telefon,
      notater
    )
    values (
      'Thomas Berg',
      'thomas.berg@example.com',
      current_date - interval '2 days',
      'betalt',
      14970.00,
      'tur',
      (select id from t2),
      '+47 905 67 890',
      'Kommer med egen gruppe, ønsker tre enkeltrom.'
    )
    returning id
  ),
  b7 as (
    -- Tur 3: betalt booking (2 deltakere)
    insert into public.bookings (
      navn,
      epost,
      dato,
      status,
      belop,
      type,
      tour_id,
      telefon,
      notater
    )
    values (
      'Siri Nilsen',
      'siri.nilsen@example.com',
      current_date - interval '5 days',
      'betalt',
      25980.00,
      'tur',
      (select id from t3),
      '+47 906 78 901',
      'Første langtur til Nordkapp.'
    )
    returning id
  ),
  b8 as (
    -- Tur 3: betalt booking (3 deltakere)
    insert into public.bookings (
      navn,
      epost,
      dato,
      status,
      belop,
      type,
      tour_id,
      telefon,
      notater
    )
    values (
      'Marius Lunde',
      'marius.lunde@example.com',
      current_date - interval '4 days',
      'betalt',
      38970.00,
      'tur',
      (select id from t3),
      '+47 907 89 012',
      'Reiser sammen med to kompiser.'
    )
    returning idx
  ),
  b9 as (
    -- Tur 3: delvis betalt booking (3 deltakere) – gjør turen full (8 deltakere totalt)
    insert into public.bookings (
      navn,
      epost,
      dato,
      status,
      belop,
      type,
      tour_id,
      telefon,
      notater
    )
    values (
      'Helene Aas',
      'helene.aas@example.com',
      current_date - interval '1 day',
      'delvis_betalt',
      25980.00,
      'tur',
      (select id from t3),
      '+47 908 90 123',
      'Betaler resten når ferieplanen er helt spikret.'
    )
    returning id
  ),
  b10 as (
    -- Tur 3: venteliste (offentlig) – ingen deltakere, brukes for ventelistefunksjon
    insert into public.bookings (
      navn,
      epost,
      dato,
      status,
      belop,
      type,
      tour_id,
      telefon,
      notater
    )
    values (
      'Venteliste Person 1',
      'venteliste1@example.com',
      current_date,
      'venteliste',
      0.00,
      'tur',
      (select id from t3),
      null,
      'Venteliste (seed-data for brukertest).'
    )
    returning id
  ),
  b11 as (
    -- Tur 3: venteliste (offentlig) – booking nr. 2 i køen
    insert into public.bookings (
      navn,
      epost,
      dato,
      status,
      belop,
      type,
      tour_id,
      telefon,
      notater
    )
    values (
      'Venteliste Person 2',
      'venteliste2@example.com',
      current_date,
      'venteliste',
      0.00,
      'tur',
      (select id from t3),
      null,
      'Venteliste (seed-data for brukertest).'
    )
    returning id
  )

-- 4) Seed participants (deltakere) til bookingene over
insert into public.participants (
  booking_id,
  name,
  email,
  telefon,
  sos_navn,
  sos_telefon
)
values
  -- b1 (2 deltakere)
  (
    (select id from b1),
    'Kari Nordmann',
    'kari.nordmann@example.com',
    '+47 900 11 222',
    'Per Nordmann',
    '+47 900 22 333'
  ),
  (
    (select id from b1),
    'Lars Nordmann',
    'lars.nordmann@example.com',
    '+47 900 44 555',
    'Per Nordmann',
    '+47 900 22 333'
  ),

  -- b2 (2 deltakere)
  (
    (select id from b2),
    'Ola Hansen',
    'ola.hansen@example.com',
    '+47 901 23 456',
    'Mari Hansen',
    '+47 901 34 567'
  ),
  (
    (select id from b2),
    'Mia Hansen',
    'mia.hansen@example.com',
    '+47 901 45 678',
    'Mari Hansen',
    '+47 901 34 567'
  ),

  -- b4 (3 deltakere – tur 2)
  (
    (select id from b4),
    'Per Johansen',
    'per.johansen@example.com',
    '+47 903 45 678',
    'Anne Johansen',
    '+47 903 56 789'
  ),
  (
    (select id from b4),
    'Tone Johansen',
    'tone.johansen@example.com',
    '+47 903 67 890',
    'Anne Johansen',
    '+47 903 56 789'
  ),
  (
    (select id from b4),
    'Erik Johansen',
    'erik.johansen@example.com',
    '+47 903 78 901',
    'Anne Johansen',
    '+47 903 56 789'
  ),

  -- b6 (3 deltakere – tur 2, slik at vi totalt får 9 deltakere på tur 2)
  (
    (select id from b6),
    'Thomas Berg',
    'thomas.berg@example.com',
    '+47 905 67 890',
    'Nina Berg',
    '+47 905 78 901'
  ),
  (
    (select id from b6),
    'Kine Berg',
    'kine.berg@example.com',
    '+47 905 89 012',
    'Nina Berg',
    '+47 905 78 901'
  ),
  (
    (select id from b6),
    'Jonas Berg',
    'jonas.berg@example.com',
    '+47 905 90 123',
    'Nina Berg',
    '+47 905 78 901'
  ),

  -- b7 (2 deltakere – tur 3)
  (
    (select id from b7),
    'Siri Nilsen',
    'siri.nilsen@example.com',
    '+47 906 78 901',
    'Arne Nilsen',
    '+47 906 89 012'
  ),
  (
    (select id from b7),
    'Knut Nilsen',
    'knut.nilsen@example.com',
    '+47 906 90 123',
    'Arne Nilsen',
    '+47 906 89 012'
  ),

  -- b8 (3 deltakere – tur 3)
  (
    (select id from b8),
    'Marius Lunde',
    'marius.lunde@example.com',
    '+47 907 89 012',
    'Siv Lunde',
    '+47 907 90 123'
  ),
  (
    (select id from b8),
    'Siv Lunde',
    'siv.lunde@example.com',
    '+47 907 90 123',
    'Kjetil Lunde',
    '+47 907 01 234'
  ),
  (
    (select id from b8),
    'Jon Lunde',
    'jon.lunde@example.com',
    '+47 907 12 345',
    'Kjetil Lunde',
    '+47 907 01 234'
  ),

  -- b9 (3 deltakere – tur 3, gjør turen full (8 plasser) sammen med b7 og b8)
  (
    (select id from b9),
    'Helene Aas',
    'helene.aas@example.com',
    '+47 908 90 123',
    'Sondre Aas',
    '+47 908 01 234'
  ),
  (
    (select id from b9),
    'Tiril Aas',
    'tiril.aas@example.com',
    '+47 908 12 345',
    'Sondre Aas',
    '+47 908 01 234'
  ),
  (
    (select id from b9),
    'Mats Aas',
    'mats.aas@example.com',
    '+47 908 23 456',
    'Sondre Aas',
    '+47 908 01 234'
  );

commit;

