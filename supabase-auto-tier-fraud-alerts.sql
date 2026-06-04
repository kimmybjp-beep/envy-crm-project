alter type public.store_tier add value if not exists 'UNASSIGNED' before 'DISTRIBUTOR';

alter table public.stores
  add column if not exists tier_locked boolean not null default false;

alter table public.stores
  alter column tier set default 'UNASSIGNED';

update public.stores
set tier = 'UNASSIGNED',
    tier_locked = false
where status = 'PENDING_APPROVAL'
  and tier = 'TIER3'
  and tier_locked = false;

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

create index if not exists scan_alerts_status_idx on public.scan_alerts (status, created_at desc);
create index if not exists scan_alerts_store_idx on public.scan_alerts (store_id, created_at desc);
create index if not exists scan_alerts_code_idx on public.scan_alerts (scanned_code);

alter table public.scan_alerts enable row level security;

drop policy if exists "Public can read scan alerts" on public.scan_alerts;
drop policy if exists "Public can update scan alerts" on public.scan_alerts;

drop function if exists public.register_scan(uuid, text);

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
      insert into public.scan_alerts (
        store_id,
        scanned_code,
        attempted_tier,
        alert_type,
        severity,
        message
      )
      values (
        v_store.id,
        v_code,
        v_target_tier,
        'LOCKED_WITH_UNASSIGNED_TIER',
        'HIGH',
        'Store tier is locked as UNASSIGNED, so scan was blocked.'
      )
      returning id into v_alert_id;

      return jsonb_build_object('ok', false, 'code', 'LOCKED_WITH_UNASSIGNED_TIER', 'alert_id', v_alert_id);
    end if;
  else
    if v_existing_tier2.id is null then
      v_target_tier := 'TIER2';
    elsif v_existing_tier2.store_id = v_store.id then
      insert into public.scan_alerts (
        store_id,
        existing_store_id,
        scanned_code,
        attempted_tier,
        alert_type,
        severity,
        message
      )
      values (
        v_store.id,
        v_existing_tier2.store_id,
        v_code,
        'TIER2',
        'SAME_STORE_TIER2_DUPLICATE',
        'CRITICAL',
        'Same store attempted to scan the same QR again at Tier 2. Possible fraud; inspect this outlet.'
      )
      returning id into v_alert_id;

      return jsonb_build_object('ok', false, 'code', 'SAME_STORE_TIER2_DUPLICATE', 'alert_id', v_alert_id);
    else
      v_target_tier := 'TIER3';
    end if;
  end if;

  if v_target_tier = 'TIER2' and v_existing_tier2.id is not null then
    insert into public.scan_alerts (
      store_id,
      existing_store_id,
      scanned_code,
      attempted_tier,
      alert_type,
      severity,
      message
    )
    values (
      v_store.id,
      v_existing_tier2.store_id,
      v_code,
      v_target_tier,
      'DUPLICATE_TIER2_CODE',
      'HIGH',
      'QR already exists in Tier 2, so this Tier 2 scan was blocked.'
    )
    returning id into v_alert_id;

    return jsonb_build_object('ok', false, 'code', 'DUPLICATE_SCAN_IN_TIER', 'alert_id', v_alert_id);
  end if;

  if v_target_tier = 'TIER3' and v_existing_tier3.id is not null then
    insert into public.scan_alerts (
      store_id,
      existing_store_id,
      scanned_code,
      attempted_tier,
      alert_type,
      severity,
      message
    )
    values (
      v_store.id,
      v_existing_tier3.store_id,
      v_code,
      v_target_tier,
      'DUPLICATE_TIER3_CODE',
      'HIGH',
      'QR already exists in Tier 3, so this Tier 3 scan was blocked.'
    )
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
    insert into public.scan_alerts (
      store_id,
      scanned_code,
      attempted_tier,
      alert_type,
      severity,
      message
    )
    values (
      p_store_id,
      upper(trim(coalesce(p_scanned_code, ''))),
      v_target_tier,
      'CONCURRENT_DUPLICATE_SCAN',
      'HIGH',
      'Concurrent scan hit the unique tier/code constraint and was blocked.'
    )
    returning id into v_alert_id;

    return jsonb_build_object('ok', false, 'code', 'DUPLICATE_SCAN_IN_TIER', 'alert_id', v_alert_id);
end;
$$;

grant execute on function public.register_scan(uuid, text) to anon, authenticated;
