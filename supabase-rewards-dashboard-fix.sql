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

alter table public.rewards
  add column if not exists name text,
  add column if not exists description text,
  add column if not exists points_required integer default 1,
  add column if not exists stock integer not null default 0,
  add column if not exists is_active boolean not null default true,
  add column if not exists created_at timestamptz not null default now();

update public.rewards
set
  name = coalesce(name, 'Untitled reward'),
  points_required = coalesce(points_required, 1),
  stock = coalesce(stock, 0),
  is_active = coalesce(is_active, true),
  created_at = coalesce(created_at, now());

alter table public.rewards
  alter column name set not null,
  alter column points_required set not null,
  alter column stock set not null,
  alter column is_active set not null,
  alter column created_at set not null;

create table if not exists public.reward_redemptions (
  id uuid primary key default gen_random_uuid(),
  reward_id uuid not null references public.rewards (id),
  store_id uuid not null references public.stores (id),
  points_spent integer not null check (points_spent > 0),
  status text not null default 'PENDING',
  created_at timestamptz not null default now()
);

alter table public.reward_redemptions
  add column if not exists reward_id uuid references public.rewards (id),
  add column if not exists store_id uuid references public.stores (id),
  add column if not exists points_spent integer default 1,
  add column if not exists status text not null default 'PENDING',
  add column if not exists created_at timestamptz not null default now();

update public.reward_redemptions
set
  points_spent = coalesce(points_spent, 1),
  status = coalesce(status, 'PENDING'),
  created_at = coalesce(created_at, now());

alter table public.reward_redemptions
  alter column points_spent set not null,
  alter column status set not null,
  alter column created_at set not null;

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
