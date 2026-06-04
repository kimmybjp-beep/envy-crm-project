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
      'UNASSIGNED',
      'DISTRIBUTOR',
      'TIER2',
      'TIER3'
    );
  end if;
end $$;

alter type public.store_tier add value if not exists 'UNASSIGNED' before 'DISTRIBUTOR';

create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_name text not null,
  phone text not null,
  password_hash text,
  password_salt text,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  image_url text,
  status public.store_status not null default 'PENDING_APPROVAL',
  tier public.store_tier not null default 'UNASSIGNED',
  tier_locked boolean not null default false,
  points integer not null default 0 check (points >= 0),
  created_at timestamptz not null default now()
);

alter table public.stores
  add column if not exists name text,
  add column if not exists owner_name text,
  add column if not exists phone text,
  add column if not exists password_hash text,
  add column if not exists password_salt text,
  add column if not exists latitude numeric(10, 7),
  add column if not exists longitude numeric(10, 7),
  add column if not exists image_url text,
  add column if not exists status public.store_status not null default 'PENDING_APPROVAL',
  add column if not exists tier public.store_tier default 'UNASSIGNED',
  add column if not exists tier_locked boolean not null default false,
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
  alter column image_url drop not null,
  alter column tier set default 'UNASSIGNED';

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

create table if not exists public.scan_alerts (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references public.stores (id) on delete set null,
  existing_store_id uuid references public.stores (id) on delete set null,
  scanned_code text not null,
  attempted_tier public.store_tier,
  alert_type text not null,
  severity text not null default 'HIGH',
  message text not null,
  status text not null default 'OPEN',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
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

create table if not exists public.rewards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  points_required integer not null check (points_required > 0),
  stock integer not null default 0 check (stock >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.reward_redemptions (
  id uuid primary key default gen_random_uuid(),
  reward_id uuid not null references public.rewards (id),
  store_id uuid not null references public.stores (id),
  points_spent integer not null check (points_spent > 0),
  status text not null default 'PENDING',
  created_at timestamptz not null default now()
);

create index if not exists stores_status_idx on public.stores (status);
create index if not exists stores_tier_idx on public.stores (tier);
create index if not exists scans_store_id_idx on public.scans (store_id);
create index if not exists scans_scanned_at_idx on public.scans (scanned_at desc);
create index if not exists scan_alerts_status_idx on public.scan_alerts (status, created_at desc);
create index if not exists scan_alerts_store_idx on public.scan_alerts (store_id, created_at desc);
create index if not exists scan_alerts_code_idx on public.scan_alerts (scanned_code);
create index if not exists admin_messages_active_idx on public.admin_messages (is_active, created_at desc);
create index if not exists qr_codes_batch_id_idx on public.qr_codes (batch_id);
create index if not exists rewards_active_idx on public.rewards (is_active, created_at desc);
create index if not exists reward_redemptions_store_idx on public.reward_redemptions (store_id, created_at desc);

create or replace function public.register_scan(
  p_store_id uuid,
  p_scanned_code text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_store public.stores;
  v_code text;
  v_target_tier public.store_tier;
  v_existing_tier2 public.scans;
  v_existing_tier3 public.scans;
  v_scan public.scans;
  v_alert_id uuid;
begin
  if p_store_id is null then
    return jsonb_build_object('ok', false, 'code', 'STORE_REQUIRED');
  end if;

  v_code := upper(trim(coalesce(p_scanned_code, '')));

  if length(v_code) < 3 then
    return jsonb_build_object('ok', false, 'code', 'INVALID_SCAN_CODE');
  end if;

  select *
  into v_store
  from public.stores
  where id = p_store_id
  for update;

  if v_store.id is null then
    return jsonb_build_object('ok', false, 'code', 'STORE_NOT_FOUND');
  end if;

  if v_store.status <> 'APPROVED' then
    return jsonb_build_object('ok', false, 'code', 'STORE_NOT_APPROVED');
  end if;

  select *
  into v_existing_tier2
  from public.scans
  where scanned_code = v_code
    and tier_level = 'TIER2'
  limit 1;

  select *
  into v_existing_tier3
  from public.scans
  where scanned_code = v_code
    and tier_level = 'TIER3'
  limit 1;

  if v_store.tier_locked then
    v_target_tier := v_store.tier;

    if v_target_tier = 'UNASSIGNED' then
      insert into public.scan_alerts (store_id, scanned_code, attempted_tier, alert_type, severity, message)
      values (v_store.id, v_code, v_target_tier, 'LOCKED_WITH_UNASSIGNED_TIER', 'HIGH', 'Store tier is locked as UNASSIGNED, so scan was blocked.')
      returning id into v_alert_id;

      return jsonb_build_object('ok', false, 'code', 'LOCKED_WITH_UNASSIGNED_TIER', 'alert_id', v_alert_id);
    end if;
  else
    if v_existing_tier2.id is null then
      v_target_tier := 'TIER2';
    elsif v_existing_tier2.store_id = v_store.id then
      insert into public.scan_alerts (store_id, existing_store_id, scanned_code, attempted_tier, alert_type, severity, message)
      values (v_store.id, v_existing_tier2.store_id, v_code, 'TIER2', 'SAME_STORE_TIER2_DUPLICATE', 'CRITICAL', 'Same store attempted to scan the same QR again at Tier 2. Possible fraud; inspect this outlet.')
      returning id into v_alert_id;

      return jsonb_build_object('ok', false, 'code', 'SAME_STORE_TIER2_DUPLICATE', 'alert_id', v_alert_id);
    else
      v_target_tier := 'TIER3';
    end if;
  end if;

  if v_target_tier = 'TIER2' and v_existing_tier2.id is not null then
    insert into public.scan_alerts (store_id, existing_store_id, scanned_code, attempted_tier, alert_type, severity, message)
    values (v_store.id, v_existing_tier2.store_id, v_code, v_target_tier, 'DUPLICATE_TIER2_CODE', 'HIGH', 'QR already exists in Tier 2, so this Tier 2 scan was blocked.')
    returning id into v_alert_id;

    return jsonb_build_object('ok', false, 'code', 'DUPLICATE_SCAN_IN_TIER', 'alert_id', v_alert_id);
  end if;

  if v_target_tier = 'TIER3' and v_existing_tier3.id is not null then
    insert into public.scan_alerts (store_id, existing_store_id, scanned_code, attempted_tier, alert_type, severity, message)
    values (v_store.id, v_existing_tier3.store_id, v_code, v_target_tier, 'DUPLICATE_TIER3_CODE', 'HIGH', 'QR already exists in Tier 3, so this Tier 3 scan was blocked.')
    returning id into v_alert_id;

    return jsonb_build_object('ok', false, 'code', 'DUPLICATE_SCAN_IN_TIER', 'alert_id', v_alert_id);
  end if;

  if not v_store.tier_locked and v_store.tier <> v_target_tier then
    update public.stores
    set tier = v_target_tier
    where id = v_store.id;
  end if;

  insert into public.scans (
    scanned_code,
    store_id,
    tier_level
  )
  values (
    v_code,
    v_store.id,
    v_target_tier
  )
  returning * into v_scan;

  update public.stores
  set points = points + 1
  where id = v_store.id;

  return jsonb_build_object(
    'ok', true,
    'code', 'SCAN_SAVED',
    'scan_id', v_scan.id,
    'tier_level', v_target_tier
  );
exception
  when unique_violation then
    insert into public.scan_alerts (store_id, scanned_code, attempted_tier, alert_type, severity, message)
    values (p_store_id, upper(trim(coalesce(p_scanned_code, ''))), v_target_tier, 'CONCURRENT_DUPLICATE_SCAN', 'HIGH', 'Concurrent scan hit the unique tier/code constraint and was blocked.')
    returning id into v_alert_id;

    return jsonb_build_object('ok', false, 'code', 'DUPLICATE_SCAN_IN_TIER', 'alert_id', v_alert_id);
end;
$$;

grant execute on function public.register_scan(uuid, text) to anon, authenticated;

insert into storage.buckets (id, name, public)
values ('storefront-photos', 'storefront-photos', true)
on conflict (id) do update set public = true;

alter table public.stores enable row level security;
alter table public.scans enable row level security;
alter table public.scan_alerts enable row level security;
alter table public.admin_messages enable row level security;
alter table public.qr_batches enable row level security;
alter table public.qr_codes enable row level security;
alter table public.rewards enable row level security;
alter table public.reward_redemptions enable row level security;

drop policy if exists "Public can insert pending stores" on public.stores;
create policy "Public can insert pending stores"
  on public.stores for insert
  with check (status = 'PENDING_APPROVAL');

drop policy if exists "Public can upload storefront photos" on storage.objects;
create policy "Public can upload storefront photos"
  on storage.objects for insert
  with check (bucket_id = 'storefront-photos');

drop policy if exists "Public can read storefront photos" on storage.objects;
create policy "Public can read storefront photos"
  on storage.objects for select
  using (bucket_id = 'storefront-photos');

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

drop policy if exists "Public can read scan alerts" on public.scan_alerts;
drop policy if exists "Public can update scan alerts" on public.scan_alerts;

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

drop policy if exists "Public can read active rewards" on public.rewards;
create policy "Public can read active rewards"
  on public.rewards for select
  using (is_active = true);

drop policy if exists "Public can manage rewards" on public.rewards;
create policy "Public can manage rewards"
  on public.rewards for all
  using (true)
  with check (true);

drop policy if exists "Public can manage reward redemptions" on public.reward_redemptions;
create policy "Public can manage reward redemptions"
  on public.reward_redemptions for all
  using (true)
  with check (true);
