-- Legg til kolonne for når en bruker ble promotert fra venteliste
ALTER TABLE public.bookings 
ADD COLUMN waitlist_promoted_at TIMESTAMPTZ DEFAULT NULL;

-- (Valgfritt) Lag en index for raskere oppslag på cron-jobber
CREATE INDEX idx_bookings_waitlist_promoted ON public.bookings(status, waitlist_promoted_at);