-- Apple ENVY CRM test data reset
-- Run this in Supabase SQL Editor when you want to clear fake/test rows.
-- This keeps all tables, enums, constraints, RLS policies, and functions.

truncate table
  reward_redemptions,
  scans,
  qr_codes,
  qr_batches,
  admin_messages,
  rewards,
  stores
restart identity cascade;

select 'envy_test_data_reset_complete' as status;
