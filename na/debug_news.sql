-- Debug: Sjekk om news tabellen eksisterer og har data
-- Kjør dette i Supabase SQL Editor

-- 1. Sjekk om tabellen eksisterer
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'news';

-- 2. Sjekk antall rader
SELECT COUNT(*) as news_count FROM news;

-- 3. Vis alle data (hvis noen)
SELECT id, title, status, created_at 
FROM news 
ORDER BY created_at DESC;

-- 4. Sjekk RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'news';
