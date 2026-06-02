-- Run this in Supabase SQL Editor if /admin/qr-generator says:
-- "สร้าง batch ไม่สำเร็จ"

create extension if not exists "pgcrypto";

create table if not exists public.qr_batches (
  id uuid primary key default gen_random_uuid(),
  distributor_name text not null,
  quantity integer not null check (quantity > 0 and quantity <= 5000),
  created_at timestamptz not null default now()
);

create table if not exists public.qr_codes (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.qr_batches (id) on delete cascade,
  distributor_name text not null,
  code char(18) not null unique,
  created_at timestamptz not null default now()
);

create index if not exists qr_codes_batch_id_idx on public.qr_codes (batch_id);

alter table public.qr_batches enable row level security;
alter table public.qr_codes enable row level security;

drop policy if exists "Public can manage qr batches" on public.qr_batches;
create policy "Public can manage qr batches"
  on public.qr_batches for all
  using (true)
  with check (true);

drop policy if exists "Public can manage qr codes" on public.qr_codes;
create policy "Public can manage qr codes"
  on public.qr_codes for all
  using (true)
  with check (true);

-- Quick permission test. If this returns a row, the QR tables can accept inserts.
select 'qr_tables_ready' as status;
