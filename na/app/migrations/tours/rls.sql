
-- create RLS policies
alter table public.tours enable row level security;

create policy "Public can read tours"
on public.tours
for select
using (true);

-- KUN admin kan opprette turer
create policy "Admin can insert tours"
on public.tours
for insert
with check (auth.jwt()->>'role' = 'admin');

-- KUN admin kan oppdatere turer
create policy "Admin can update tours"
on public.tours
for update
using (auth.jwt()->>'role' = 'admin')
with check (auth.jwt()->>'role' = 'admin');

-- KUN admin kan slette turer
create policy "Admin can delete tours"
on public.tours
for delete
using (auth.jwt()->>'role' = 'admin');
