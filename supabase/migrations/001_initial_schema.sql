create extension if not exists "pgcrypto";

create type public.user_role as enum (
  'ADMIN',
  'DISTRIBUTOR',
  'WHOLESALER',
  'RETAILER'
);

create type public.store_status as enum (
  'PENDING_APPROVAL',
  'APPROVED',
  'REJECTED'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null,
  role public.user_role not null default 'RETAILER',
  created_at timestamptz not null default now()
);

create table public.stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  store_name text not null,
  owner_name text not null,
  phone text not null,
  latitude numeric(10, 7) not null,
  longitude numeric(10, 7) not null,
  storefront_photo_path text not null,
  tier_level smallint not null check (tier_level in (2, 3)),
  status public.store_status not null default 'PENDING_APPROVAL',
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.scan_events (
  id uuid primary key default gen_random_uuid(),
  scanned_code text not null,
  tier_level smallint not null check (tier_level in (1, 2, 3)),
  scanned_by uuid not null references public.profiles (id),
  store_id uuid references public.stores (id),
  quantity integer not null default 1 check (quantity > 0),
  notes text,
  scanned_at timestamptz not null default now(),
  unique (tier_level, scanned_code)
);

create index scan_events_scanned_by_idx on public.scan_events (scanned_by, scanned_at desc);
create index stores_owner_id_idx on public.stores (owner_id);
create index stores_status_idx on public.stores (status);

alter table public.profiles enable row level security;
alter table public.stores enable row level security;
alter table public.scan_events enable row level security;

create or replace function public.current_user_role()
returns public.user_role
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'ADMIN', false)
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', 'New User'),
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'RETAILER')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create policy "Profiles are visible to owner or admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "Profiles are editable by owner or admin"
  on public.profiles for update
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

create policy "Stores are visible to owner or admin"
  on public.stores for select
  using (owner_id = auth.uid() or public.is_admin());

create policy "Users can create their pending store"
  on public.stores for insert
  with check (
    owner_id = auth.uid()
    and status = 'PENDING_APPROVAL'
    and tier_level in (2, 3)
  );

create policy "Admins can review stores"
  on public.stores for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Scans are visible to owner or admin"
  on public.scan_events for select
  using (scanned_by = auth.uid() or public.is_admin());

create policy "Admins can see all scans"
  on public.scan_events for all
  using (public.is_admin())
  with check (public.is_admin());

create or replace function public.register_scan(
  p_scanned_code text,
  p_tier_level smallint,
  p_store_id uuid default null,
  p_quantity integer default 1,
  p_notes text default null
)
returns public.scan_events
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role public.user_role;
  v_store public.stores;
  v_scan public.scan_events;
begin
  select role into v_role
  from public.profiles
  where id = auth.uid();

  if v_role is null then
    raise exception 'PROFILE_REQUIRED' using errcode = '28000';
  end if;

  if p_scanned_code is null or length(trim(p_scanned_code)) < 3 then
    raise exception 'INVALID_SCAN_CODE' using errcode = '22023';
  end if;

  if p_tier_level not in (1, 2, 3) then
    raise exception 'INVALID_TIER' using errcode = '22023';
  end if;

  if p_quantity < 1 then
    raise exception 'INVALID_QUANTITY' using errcode = '22023';
  end if;

  if v_role = 'ADMIN' then
    null;
  elsif v_role = 'DISTRIBUTOR' and p_tier_level = 1 then
    null;
  elsif v_role in ('WHOLESALER', 'RETAILER') then
    if p_store_id is null then
      raise exception 'STORE_REQUIRED' using errcode = '23502';
    end if;

    select * into v_store
    from public.stores
    where id = p_store_id
      and owner_id = auth.uid();

    if v_store.id is null then
      raise exception 'STORE_NOT_FOUND' using errcode = '42501';
    end if;

    if v_store.status <> 'APPROVED' then
      raise exception 'STORE_NOT_APPROVED' using errcode = '42501';
    end if;

    if v_store.tier_level <> p_tier_level then
      raise exception 'TIER_STORE_MISMATCH' using errcode = '42501';
    end if;
  else
    raise exception 'ROLE_NOT_ALLOWED_FOR_TIER' using errcode = '42501';
  end if;

  insert into public.scan_events (
    scanned_code,
    tier_level,
    scanned_by,
    store_id,
    quantity,
    notes
  )
  values (
    upper(trim(p_scanned_code)),
    p_tier_level,
    auth.uid(),
    p_store_id,
    p_quantity,
    nullif(trim(p_notes), '')
  )
  returning * into v_scan;

  return v_scan;
exception
  when unique_violation then
    raise exception 'DUPLICATE_SCAN_IN_TIER' using errcode = '23505';
end;
$$;

grant execute on function public.register_scan(text, smallint, uuid, integer, text) to authenticated;

insert into storage.buckets (id, name, public)
values ('storefronts', 'storefronts', false)
on conflict (id) do nothing;

create policy "Storefront owners can upload photos"
  on storage.objects for insert
  with check (
    bucket_id = 'storefronts'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Storefront owners and admins can read photos"
  on storage.objects for select
  using (
    bucket_id = 'storefronts'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );
