# Apple ENVY CRM

Secure CRM and multi-tier supply-chain scan tracking for T&G South East Asia.

## Stack

- Next.js App Router
- Supabase Auth, PostgreSQL, RLS, RPC, and Storage
- Tailwind CSS with Apple ENVY luxury styling

## Setup

1. Create a Supabase project.
2. Run `supabase/migrations/001_initial_schema.sql` in the Supabase SQL editor or via the Supabase CLI.
3. Copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` only if you later add service-role admin jobs
4. Install dependencies with `npm install`.
5. Run `npm run dev`.

## Admin Bootstrap

New users can self-register as Distributor, Wholesaler, or Retailer. Promote the first back-office user from the Supabase SQL editor:

```sql
update public.profiles
set role = 'ADMIN'
where email = 'admin@example.com';
```

## Core Invariants

- Tier 2 and Tier 3 stores start as `PENDING_APPROVAL`.
- Unapproved stores cannot register scans.
- Duplicate QR/barcode scans are blocked by `unique (tier_level, scanned_code)`.
- Scan writes go through `public.register_scan(...)`, which validates role, store approval, tier match, and duplicate constraints inside PostgreSQL.
