-- Run this in Supabase SQL Editor if store registration says:
-- "Store onboarding could not be submitted."
--
-- This fixes projects that were created with an older schema version.

create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'store_status') then
    create type public.store_status as enum ('PENDING_APPROVAL', 'APPROVED', 'REJECTED');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'store_tier') then
    create type public.store_tier as enum ('DISTRIBUTOR', 'TIER2', 'TIER3');
  end if;
end $$;

alter table public.stores
  add column if not exists name text,
  add column if not exists owner_name text,
  add column if not exists phone text,
  add column if not exists latitude numeric(10, 7),
  add column if not exists longitude numeric(10, 7),
  add column if not exists image_url text,
  add column if not exists status public.store_status not null default 'PENDING_APPROVAL',
  add column if not exists tier public.store_tier,
  add column if not exists points integer not null default 0 check (points >= 0),
  add column if not exists created_at timestamptz not null default now();

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'stores' and column_name = 'store_name'
  ) then
    execute 'update public.stores set name = coalesce(name, store_name)';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'stores' and column_name = 'tier_level'
  ) then
    execute $sql$
      update public.stores
      set tier = coalesce(
        tier,
        case
          when tier_level = 1 then 'DISTRIBUTOR'::public.store_tier
          when tier_level = 2 then 'TIER2'::public.store_tier
          when tier_level = 3 then 'TIER3'::public.store_tier
          else 'TIER3'::public.store_tier
        end
      )
    $sql$;
  end if;
end $$;

alter table public.stores
  alter column latitude drop not null,
  alter column longitude drop not null,
  alter column image_url drop not null;

drop policy if exists "Public can insert pending stores" on public.stores;
create policy "Public can insert pending stores"
  on public.stores for insert
  with check (status = 'PENDING_APPROVAL');

drop policy if exists "Public can read stores" on public.stores;
create policy "Public can read stores"
  on public.stores for select
  using (true);

drop policy if exists "Public can update store review status" on public.stores;
create policy "Public can update store review status"
  on public.stores for update
  using (true)
  with check (status in ('PENDING_APPROVAL', 'APPROVED', 'REJECTED'));
