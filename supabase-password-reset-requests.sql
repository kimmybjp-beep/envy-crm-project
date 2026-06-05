-- ENVY Reward CRM password reset request queue.
-- Run in Supabase SQL Editor once, or keep as reference for the production schema.

create table if not exists public.password_reset_requests (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references public.stores (id) on delete set null,
  phone text not null,
  status text not null default 'OPEN' check (status in ('OPEN', 'RESOLVED', 'CANCELLED')),
  requested_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by text,
  note text
);

create index if not exists password_reset_requests_status_idx
  on public.password_reset_requests (status, requested_at desc);

create index if not exists password_reset_requests_store_idx
  on public.password_reset_requests (store_id, requested_at desc);

create index if not exists password_reset_requests_phone_idx
  on public.password_reset_requests (phone, requested_at desc);

alter table public.password_reset_requests enable row level security;

grant all on table public.password_reset_requests to service_role;

select 'password_reset_requests_ready' as status;
