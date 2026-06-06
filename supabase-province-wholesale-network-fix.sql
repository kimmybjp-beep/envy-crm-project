-- ENVY Reward CRM province field and 2-step wholesale network scan fix.

alter table public.stores
  add column if not exists province text;

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
  set
    status = 'claimed',
    claimed_by_outlet_id = coalesce(claimed_by_outlet_id, v_store.id),
    claimed_at = coalesce(claimed_at, now())
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

grant execute on function public.register_scan(uuid, text) to anon, authenticated;

select 'province_and_wholesale_network_ready' as status;
