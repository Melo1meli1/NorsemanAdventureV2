drop policy if exists "Admin can insert tours" on public.tours;
drop policy if exists "Admin can update tours" on public.tours;
drop policy if exists "Admin can delete tours" on public.tours;

create policy "Admin can insert tours"
on public.tours for insert
with check (auth.role() = 'authenticated');

create policy "Admin can update tours"
on public.tours for update
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "Admin can delete tours"
on public.tours for delete
using (auth.role() = 'authenticated');
