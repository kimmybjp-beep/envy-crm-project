insert into storage.buckets (id, name, public)
values ('storefront-photos', 'storefront-photos', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can upload storefront photos" on storage.objects;
create policy "Public can upload storefront photos"
  on storage.objects for insert
  with check (bucket_id = 'storefront-photos');

drop policy if exists "Public can read storefront photos" on storage.objects;
create policy "Public can read storefront photos"
  on storage.objects for select
  using (bucket_id = 'storefront-photos');
