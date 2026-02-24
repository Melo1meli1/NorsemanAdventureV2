-- Fix draft tours without end_date
-- Kjør dette i Supabase SQL Editor

-- 1. Sjekk hvilke draft-turer som mangler end_date
SELECT id, title, status, start_date, end_date, created_at
FROM tours 
WHERE status = 'draft' AND end_date IS NULL;

-- 2. Sett end_date til 30 dager etter start_date for draft-turer
UPDATE tours 
SET end_date = start_date + interval '30 days'
WHERE status = 'draft' AND end_date IS NULL;

-- 3. Verifiser at fiksen virket
SELECT id, title, status, start_date, end_date, created_at
FROM tours 
WHERE status = 'draft' 
ORDER BY created_at DESC;

-- 4. Hvis du heller vil sette end_date til NULL for alle draft-turer:
-- UPDATE tours SET end_date = NULL WHERE status = 'draft';
