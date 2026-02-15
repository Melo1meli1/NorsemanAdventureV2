-- Lagre betalt beløp ved status «delvis betalt»
alter table public.bookings
  add column if not exists betalt_belop numeric(10, 2) null;

comment on column public.bookings.betalt_belop is 'Beløp som er betalt (kun relevant når status = delvis_betalt).';
