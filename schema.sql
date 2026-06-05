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

-- ENVY Partner Rewards QR upgrade.
-- QR batches are size-based and distributor-applied. Outlets claim one QR once.

alter table public.qr_codes
  alter column code type text using trim(code::text);

alter table public.qr_batches
  add column if not exists batch_name text,
  add column if not exists distributor_id text,
  add column if not exists apple_size text,
  add column if not exists sticker_color text,
  add column if not exists sticker_color_name text,
  add column if not exists point_value integer not null default 1,
  add column if not exists campaign_name text,
  add column if not exists generated_at timestamptz not null default now(),
  add column if not exists generated_by text not null default 'admin',
  add column if not exists status text not null default 'generated';

alter table public.qr_codes
  add column if not exists qr_code text,
  add column if not exists human_readable_code text,
  add column if not exists distributor_id text,
  add column if not exists apple_size text,
  add column if not exists sticker_color text,
  add column if not exists sticker_color_name text,
  add column if not exists point_value integer not null default 1,
  add column if not exists campaign_name text,
  add column if not exists status text not null default 'generated',
  add column if not exists claimed_by_outlet_id uuid references public.stores (id) on delete set null,
  add column if not exists claimed_at timestamptz;

update public.qr_batches
set
  batch_name = coalesce(batch_name, distributor_name || ' / ENVY Rewards'),
  distributor_id = coalesce(distributor_id, upper(regexp_replace(distributor_name, '[^A-Za-z0-9]+', '', 'g'))),
  apple_size = coalesce(apple_size, 'other'),
  sticker_color = coalesce(sticker_color, '#757575'),
  sticker_color_name = coalesce(sticker_color_name, 'Gray'),
  point_value = greatest(coalesce(point_value, 1), 1),
  campaign_name = coalesce(campaign_name, 'General Rewards'),
  generated_at = coalesce(generated_at, created_at),
  generated_by = coalesce(generated_by, 'admin'),
  status = coalesce(status, 'generated');

update public.qr_codes
set
  human_readable_code = coalesce(human_readable_code, trim(code::text)),
  qr_code = coalesce(qr_code, trim(code::text)),
  distributor_id = coalesce(distributor_id, upper(regexp_replace(distributor_name, '[^A-Za-z0-9]+', '', 'g'))),
  apple_size = coalesce(apple_size, 'other'),
  sticker_color = coalesce(sticker_color, '#757575'),
  sticker_color_name = coalesce(sticker_color_name, 'Gray'),
  point_value = greatest(coalesce(point_value, 1), 1),
  campaign_name = coalesce(campaign_name, 'General Rewards'),
  status = coalesce(status, 'generated');

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'qr_batches_point_value_check' and conrelid = 'public.qr_batches'::regclass) then
    alter table public.qr_batches add constraint qr_batches_point_value_check check (point_value > 0);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'qr_batches_status_check' and conrelid = 'public.qr_batches'::regclass) then
    alter table public.qr_batches add constraint qr_batches_status_check check (status in ('draft', 'generated', 'printed', 'issued', 'void'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'qr_codes_point_value_check' and conrelid = 'public.qr_codes'::regclass) then
    alter table public.qr_codes add constraint qr_codes_point_value_check check (point_value > 0);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'qr_codes_status_check' and conrelid = 'public.qr_codes'::regclass) then
    alter table public.qr_codes add constraint qr_codes_status_check check (status in ('generated', 'issued', 'claimed', 'void'));
  end if;

  if not exists (select 1 from pg_constraint where conname = 'qr_codes_human_readable_code_key' and conrelid = 'public.qr_codes'::regclass) then
    alter table public.qr_codes add constraint qr_codes_human_readable_code_key unique (human_readable_code);
  end if;
end $$;

create table if not exists public.qr_code_counters (
  prefix text primary key,
  last_number integer not null default 0 check (last_number >= 0),
  updated_at timestamptz not null default now()
);

create or replace function public.reserve_qr_code_range(
  p_prefix text,
  p_quantity integer
)
returns table(start_number integer, end_number integer)
language plpgsql
set search_path = public
as $$
begin
  if p_prefix is null or length(trim(p_prefix)) < 3 then
    raise exception 'Invalid QR prefix';
  end if;

  if p_quantity is null or p_quantity < 1 or p_quantity > 5000 then
    raise exception 'Invalid QR quantity';
  end if;

  insert into public.qr_code_counters (prefix, last_number)
  values (upper(trim(p_prefix)), 0)
  on conflict (prefix) do nothing;

  update public.qr_code_counters as counter
  set
    last_number = counter.last_number + p_quantity,
    updated_at = now()
  where counter.prefix = upper(trim(p_prefix))
  returning counter.last_number - p_quantity + 1, counter.last_number
  into start_number, end_number;

  return next;
end;
$$;

create index if not exists qr_batches_status_idx on public.qr_batches (status, generated_at desc);
create index if not exists qr_batches_distributor_size_idx on public.qr_batches (distributor_name, apple_size);
create index if not exists qr_codes_status_idx on public.qr_codes (status, created_at desc);
create index if not exists qr_codes_distributor_size_idx on public.qr_codes (distributor_name, apple_size);
create index if not exists qr_codes_claimed_by_idx on public.qr_codes (claimed_by_outlet_id, claimed_at desc);

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
  v_qr_code public.qr_codes;
  v_raw_code text;
  v_code text;
  v_target_tier public.store_tier;
  v_existing_tier2 public.scans;
  v_existing_tier3 public.scans;
  v_scan public.scans;
  v_alert_id uuid;
  v_points integer;
begin
  if p_store_id is null then
    return jsonb_build_object('ok', false, 'code', 'STORE_REQUIRED');
  end if;

  v_raw_code := upper(trim(coalesce(p_scanned_code, '')));
  v_code := v_raw_code;

  if v_code like 'HTTP://%' or v_code like 'HTTPS://%' then
    v_code := regexp_replace(split_part(v_code, '?', 1), '^.*/', '');
    v_code := upper(trim(v_code));
  end if;

  if length(v_code) < 3 then
    return jsonb_build_object('ok', false, 'code', 'INVALID_SCAN_CODE');
  end if;

  select * into v_store from public.stores where id = p_store_id for update;

  if v_store.id is null then
    return jsonb_build_object('ok', false, 'code', 'STORE_NOT_FOUND');
  end if;

  if v_store.status <> 'APPROVED' then
    return jsonb_build_object('ok', false, 'code', 'STORE_NOT_APPROVED');
  end if;

  select *
  into v_qr_code
  from public.qr_codes
  where upper(trim(code)) = v_code
     or upper(trim(coalesce(human_readable_code, ''))) = v_code
     or upper(trim(coalesce(qr_code, ''))) = v_raw_code
     or upper(trim(coalesce(qr_code, ''))) = v_code
  limit 1
  for update;

  if v_qr_code.id is null then
    return jsonb_build_object('ok', false, 'code', 'QR_NOT_FOUND');
  end if;

  if v_qr_code.status = 'claimed' then
    return jsonb_build_object('ok', false, 'code', 'QR_ALREADY_CLAIMED');
  end if;

  if v_qr_code.status = 'void' then
    return jsonb_build_object('ok', false, 'code', 'QR_NOT_FOUND');
  end if;

  v_points := greatest(coalesce(v_qr_code.point_value, 1), 1);

  select * into v_existing_tier2 from public.scans where scanned_code = v_code and tier_level = 'TIER2' limit 1;
  select * into v_existing_tier3 from public.scans where scanned_code = v_code and tier_level = 'TIER3' limit 1;

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
    update public.stores set tier = v_target_tier where id = v_store.id;
  end if;

  insert into public.scans (scanned_code, store_id, tier_level)
  values (v_code, v_store.id, v_target_tier)
  returning * into v_scan;

  update public.qr_codes
  set status = 'claimed', claimed_by_outlet_id = v_store.id, claimed_at = now()
  where id = v_qr_code.id;

  update public.stores set points = points + v_points where id = v_store.id;

  return jsonb_build_object(
    'ok', true,
    'code', 'SCAN_SAVED',
    'scan_id', v_scan.id,
    'tier_level', v_target_tier,
    'points_added', v_points,
    'qr_id', v_qr_code.id,
    'distributor_name', v_qr_code.distributor_name,
    'apple_size', v_qr_code.apple_size,
    'campaign_name', v_qr_code.campaign_name
  );
exception
  when unique_violation then
    insert into public.scan_alerts (store_id, scanned_code, attempted_tier, alert_type, severity, message)
    values (p_store_id, v_code, v_target_tier, 'CONCURRENT_DUPLICATE_SCAN', 'HIGH', 'Concurrent scan hit the unique tier/code constraint and was blocked.')
    returning id into v_alert_id;

    return jsonb_build_object('ok', false, 'code', 'DUPLICATE_SCAN_IN_TIER', 'alert_id', v_alert_id);
end;
$$;

alter table public.qr_code_counters enable row level security;
revoke all on public.qr_batches from anon, authenticated;
revoke all on public.qr_codes from anon, authenticated;
grant select, insert, update, delete on public.qr_code_counters to service_role;
grant execute on function public.reserve_qr_code_range(text, integer) to service_role;

drop policy if exists "Public can manage qr batches" on public.qr_batches;
drop policy if exists "Public can manage qr codes" on public.qr_codes;

drop policy if exists "Service role can manage qr counters" on public.qr_code_counters;
create policy "Service role can manage qr counters"
  on public.qr_code_counters for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
