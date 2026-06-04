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

alter table public.rewards
  add column if not exists description text,
  add column if not exists points_required integer not null default 1,
  add column if not exists stock integer not null default 0,
  add column if not exists is_active boolean not null default true,
  add column if not exists created_at timestamptz not null default now();

alter table public.reward_redemptions
  add column if not exists points_spent integer not null default 1,
  add column if not exists status text not null default 'PENDING',
  add column if not exists created_at timestamptz not null default now();

create index if not exists rewards_active_idx on public.rewards (is_active, created_at desc);
create index if not exists reward_redemptions_store_idx on public.reward_redemptions (store_id, created_at desc);
create index if not exists reward_redemptions_status_idx on public.reward_redemptions (status, created_at desc);

alter table public.rewards enable row level security;
alter table public.reward_redemptions enable row level security;

drop policy if exists "Public can read active rewards" on public.rewards;
create policy "Public can read active rewards"
  on public.rewards for select
  using (is_active = true);

drop policy if exists "Public can manage rewards" on public.rewards;
drop policy if exists "Public can manage reward redemptions" on public.reward_redemptions;

grant usage on schema public to anon, authenticated, service_role;
grant select on public.rewards to anon, authenticated;
grant all on public.rewards to service_role;
grant all on public.reward_redemptions to service_role;

select 'rewards_service_role_ready' as status;
