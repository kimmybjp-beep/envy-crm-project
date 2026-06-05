-- ENVY Partner Rewards QR upgrade
-- Adds distributor + size + point-value sticker metadata and one-QR-one-claim logic.

create extension if not exists "pgcrypto";

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
  code text not null unique,
  created_at timestamptz not null default now()
);

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
  if not exists (
    select 1 from pg_constraint
    where conname = 'qr_batches_point_value_check'
      and conrelid = 'public.qr_batches'::regclass
  ) then
    alter table public.qr_batches
      add constraint qr_batches_point_value_check check (point_value > 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'qr_batches_status_check'
      and conrelid = 'public.qr_batches'::regclass
  ) then
    alter table public.qr_batches
      add constraint qr_batches_status_check check (status in ('draft', 'generated', 'printed', 'issued', 'void'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'qr_codes_point_value_check'
      and conrelid = 'public.qr_codes'::regclass
  ) then
    alter table public.qr_codes
      add constraint qr_codes_point_value_check check (point_value > 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'qr_codes_status_check'
      and conrelid = 'public.qr_codes'::regclass
  ) then
    alter table public.qr_codes
      add constraint qr_codes_status_check check (status in ('generated', 'issued', 'claimed', 'void'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'qr_codes_human_readable_code_key'
      and conrelid = 'public.qr_codes'::regclass
  ) then
    alter table public.qr_codes
      add constraint qr_codes_human_readable_code_key unique (human_readable_code);
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

with latest_claims as (
  select distinct on (upper(trim(scanned_code)))
    upper(trim(scanned_code)) as scanned_code,
    store_id,
    scanned_at
  from public.scans
  order by upper(trim(scanned_code)), scanned_at desc
)
update public.qr_codes as qr
set
  status = 'claimed',
  claimed_by_outlet_id = latest_claims.store_id,
  claimed_at = latest_claims.scanned_at
from latest_claims
where upper(trim(qr.code)) = latest_claims.scanned_code
  and qr.status <> 'claimed';

create index if not exists qr_batches_status_idx on public.qr_batches (status, generated_at desc);
create index if not exists qr_batches_distributor_size_idx on public.qr_batches (distributor_name, apple_size);
create index if not exists qr_codes_batch_id_idx on public.qr_codes (batch_id);
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

  update public.qr_codes
  set
    status = 'claimed',
    claimed_by_outlet_id = v_store.id,
    claimed_at = now()
  where id = v_qr_code.id;

  update public.stores
  set points = points + v_points
  where id = v_store.id;

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

alter table public.qr_batches enable row level security;
alter table public.qr_codes enable row level security;
alter table public.qr_code_counters enable row level security;

grant usage on schema public to anon, authenticated;
revoke all on public.qr_batches from anon, authenticated;
revoke all on public.qr_codes from anon, authenticated;
grant select, insert, update, delete on public.qr_code_counters to service_role;
grant execute on function public.register_scan(uuid, text) to anon, authenticated;
grant execute on function public.reserve_qr_code_range(text, integer) to service_role;

drop policy if exists "Public can manage qr batches" on public.qr_batches;
drop policy if exists "Public can manage qr codes" on public.qr_codes;

drop policy if exists "Service role can manage qr counters" on public.qr_code_counters;
create policy "Service role can manage qr counters"
  on public.qr_code_counters for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

select 'qr_size_distributor_tables_ready' as status;
