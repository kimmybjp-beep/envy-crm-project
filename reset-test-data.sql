-- Apple ENVY CRM test data reset
-- Run this in Supabase SQL Editor when you want to clear fake/test rows.
-- This keeps all tables, enums, constraints, RLS policies, and functions.

truncate table
  reward_redemptions,
  password_reset_requests,
  scans,
  scan_alerts,
  qr_codes,
  qr_batches,
  qr_code_counters,
  admin_messages,
  rewards,
  stores
restart identity cascade;

select
  'envy_test_data_reset_complete' as status,
  (select count(*) from stores) as stores,
  (select count(*) from scans) as scans,
  (select count(*) from scan_alerts) as scan_alerts,
  (select count(*) from qr_codes) as qr_codes,
  (select count(*) from qr_batches) as qr_batches,
  (select count(*) from qr_code_counters) as qr_code_counters,
  (select count(*) from admin_messages) as admin_messages,
  (select count(*) from password_reset_requests) as password_reset_requests,
  (select count(*) from rewards) as rewards,
  (select count(*) from reward_redemptions) as reward_redemptions;
