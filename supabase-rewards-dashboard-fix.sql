-- Run this in Supabase SQL Editor to add Rewards, Redemptions,
-- and admin dashboard/export support tables.

create extension if not exists "pgcrypto";

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

create index if not exists rewards_active_idx on public.rewards (is_active, created_at desc);
create index if not exists reward_redemptions_store_idx on public.reward_redemptions (store_id, created_at desc);

alter table public.rewards enable row level security;
alter table public.reward_redemptions enable row level security;

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

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.rewards to anon, authenticated;
grant select, insert, update, delete on public.reward_redemptions to anon, authenticated;

select 'rewards_dashboard_ready' as status;
