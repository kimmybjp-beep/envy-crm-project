create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'store_status') then
    create type public.store_status as enum (
      'PENDING_APPROVAL',
      'APPROVED',
      'REJECTED'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'store_tier') then
    create type public.store_tier as enum (
      'DISTRIBUTOR',
      'TIER2',
      'TIER3'
    );
  end if;
end $$;

create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_name text not null,
  phone text not null,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  image_url text,
  status public.store_status not null default 'PENDING_APPROVAL',
  tier public.store_tier not null,
  points integer not null default 0 check (points >= 0),
  created_at timestamptz not null default now()
);

alter table public.stores
  add column if not exists name text,
  add column if not exists owner_name text,
  add column if not exists phone text,
  add column if not exists latitude numeric(10, 7),
  add column if not exists longitude numeric(10, 7),
  add column if not exists image_url text,
  add column if not exists status public.store_status not null default 'PENDING_APPROVAL',
  add column if not exists tier public.store_tier,
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
  add column if not exists points integer not null default 0 check (points >= 0);

alter table public.stores
  alter column latitude drop not null,
  alter column longitude drop not null,
  alter column image_url drop not null;

create table if not exists public.scans (
  id uuid primary key default gen_random_uuid(),
  scanned_code text not null,
  store_id uuid references public.stores (id) on delete set null,
  tier_level public.store_tier not null,
  scanned_at timestamptz not null default now(),
  constraint scans_tier_level_scanned_code_key unique (tier_level, scanned_code)
);

create table if not exists public.admin_messages (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.qr_batches (
  id uuid primary key default gen_random_uuid(),
  distributor_name text not null,
  quantity integer not null check (quantity > 0 and quantity <= 5000),
  created_at timestamptz not null default now()
);

create table if not exists public.qr_codes (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.qr_batches (id) on delete cascade,
  distributor_name text not null,
  code char(18) not null unique,
  created_at timestamptz not null default now()
);

create index if not exists stores_status_idx on public.stores (status);
create index if not exists stores_tier_idx on public.stores (tier);
create index if not exists scans_store_id_idx on public.scans (store_id);
create index if not exists scans_scanned_at_idx on public.scans (scanned_at desc);
create index if not exists admin_messages_active_idx on public.admin_messages (is_active, created_at desc);
create index if not exists qr_codes_batch_id_idx on public.qr_codes (batch_id);

create or replace function public.register_scan(
  p_store_id uuid,
  p_scanned_code text
)
returns public.scans
language plpgsql
security definer
set search_path = public
as $$
declare
  v_store public.stores;
  v_scan public.scans;
begin
  if p_store_id is null then
    raise exception 'STORE_REQUIRED' using errcode = '23502';
  end if;

  if p_scanned_code is null or length(trim(p_scanned_code)) < 3 then
    raise exception 'INVALID_SCAN_CODE' using errcode = '22023';
  end if;

  select *
  into v_store
  from public.stores
  where id = p_store_id;

  if v_store.id is null then
    raise exception 'STORE_NOT_FOUND' using errcode = '22023';
  end if;

  if v_store.status <> 'APPROVED' then
    raise exception 'STORE_NOT_APPROVED' using errcode = '42501';
  end if;

  insert into public.scans (
    scanned_code,
    store_id,
    tier_level
  )
  values (
    upper(trim(p_scanned_code)),
    v_store.id,
    v_store.tier
  )
  returning * into v_scan;

  update public.stores
  set points = points + 1
  where id = v_store.id;

  return v_scan;
exception
  when unique_violation then
    raise exception 'DUPLICATE_SCAN_IN_TIER' using errcode = '23505';
end;
$$;

grant execute on function public.register_scan(uuid, text) to anon, authenticated;

alter table public.stores enable row level security;
alter table public.scans enable row level security;
alter table public.admin_messages enable row level security;
alter table public.qr_batches enable row level security;
alter table public.qr_codes enable row level security;

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

drop policy if exists "Public can insert scans for approved stores" on public.scans;
create policy "Public can insert scans for approved stores"
  on public.scans for insert
  with check (
    exists (
      select 1
      from public.stores
      where stores.id = scans.store_id
        and stores.status = 'APPROVED'
        and stores.tier = scans.tier_level
    )
  );

drop policy if exists "Public can read scans" on public.scans;
create policy "Public can read scans"
  on public.scans for select
  using (true);

drop policy if exists "Public can read active admin messages" on public.admin_messages;
create policy "Public can read active admin messages"
  on public.admin_messages for select
  using (is_active = true);

drop policy if exists "Public can manage admin messages" on public.admin_messages;
create policy "Public can manage admin messages"
  on public.admin_messages for all
  using (true)
  with check (true);

drop policy if exists "Public can manage qr batches" on public.qr_batches;
create policy "Public can manage qr batches"
  on public.qr_batches for all
  using (true)
  with check (true);

drop policy if exists "Public can manage qr codes" on public.qr_codes;
create policy "Public can manage qr codes"
  on public.qr_codes for all
  using (true)
  with check (true);
