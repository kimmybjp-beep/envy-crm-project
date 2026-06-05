-- Deprecated.
-- Use supabase-qr-size-distributor-fix.sql instead.
--
-- The old MVP QR generator used random 18-digit codes and public manage policies.
-- The current ENVY Partner Rewards flow uses:
-- Distributor + Apple Size + Point Value + Campaign + Sticker Color + Claim Status.
--
-- Do not run the old QR table fix anymore.
select 'use_supabase_qr_size_distributor_fix_sql' as status;
