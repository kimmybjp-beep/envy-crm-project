-- Apple ENVY CRM security + rewards fulfillment fix
-- Run this in Supabase SQL Editor before using password login in production.

alter table public.stores
  add column if not exists password_hash text,
  add column if not exists password_salt text;

create index if not exists stores_phone_idx on public.stores (phone);
create index if not exists reward_redemptions_status_idx on public.reward_redemptions (status, created_at desc);

-- Existing stores created before this migration do not have passwords.
-- They must register again or be assigned a password by a secure admin-only process.
select 'security_fulfillment_ready' as status;
