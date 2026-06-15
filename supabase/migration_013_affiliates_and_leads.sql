-- ───────────────────────────────────────────────────────────────────────────
-- Migration 013: Affiliate platform + richer lead capture
--
-- Adds the affiliate program tables (tiers, affiliate profiles, payouts) on top
-- of the existing referral_codes/referrals tables, plus UTM/IP capture columns
-- on leads for a richer CSV export.
--
-- Idempotent. Safe to re-run. Run in the Supabase SQL editor.
-- ───────────────────────────────────────────────────────────────────────────

-- ── Affiliate tiers (Bronze/Silver/Gold …) ──────────────────────────────────
create table if not exists public.affiliate_tiers (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  min_sales       int  not null default 0,          -- # of paid referrals to reach
  min_revenue_cents bigint not null default 0,       -- or lifetime revenue brought
  cash_percent    int  not null default 0,           -- cash % per sale at this tier
  fixed_cash_cents int not null default 0,           -- flat cash per sale at this tier
  self_discount_percent int not null default 0,      -- discount for the affiliate's own purchases
  perks           jsonb not null default '[]'::jsonb,
  sort_order      int  not null default 0,
  created_at      timestamptz not null default now()
);

-- ── Affiliate profiles ───────────────────────────────────────────────────────
-- One row per affiliate (a member admitted to the program). Their link code
-- lives in referral_codes (kind='affiliate'); this holds the reward config,
-- balance and Stripe Connect link.
create table if not exists public.affiliates (
  user_id              uuid primary key references auth.users(id) on delete cascade,
  code                 text references public.referral_codes(code) on delete set null,
  status               text not null default 'active',  -- active | pending | suspended
  reward_type          text not null default 'percent_cash', -- percent_cash | fixed_cash | both
  cash_percent         int  not null default 20,         -- % of sale paid out as cash
  fixed_cash_cents     int  not null default 0,          -- flat cash per sale
  self_discount_percent int not null default 0,          -- discount on affiliate's own purchases
  can_issue_coupons    boolean not null default false,
  tier_id              uuid references public.affiliate_tiers(id) on delete set null,
  stripe_account_id    text,                             -- Stripe Connect account
  stripe_onboarded     boolean not null default false,
  balance_cents        bigint not null default 0,        -- unpaid, approved earnings
  lifetime_earned_cents bigint not null default 0,
  notes                text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists affiliates_status_idx on public.affiliates(status);

-- ── Affiliate payouts ────────────────────────────────────────────────────────
create table if not exists public.affiliate_payouts (
  id                uuid primary key default gen_random_uuid(),
  affiliate_user_id uuid not null references auth.users(id) on delete cascade,
  amount_cents      bigint not null,
  status            text not null default 'pending',   -- pending | processing | paid | failed
  method            text not null default 'stripe',    -- stripe | manual
  stripe_transfer_id text,
  note              text,
  created_at        timestamptz not null default now(),
  paid_at           timestamptz
);

create index if not exists affiliate_payouts_user_idx
  on public.affiliate_payouts(affiliate_user_id, created_at desc);

-- ── Richer lead capture ──────────────────────────────────────────────────────
alter table public.leads add column if not exists utm_source text;
alter table public.leads add column if not exists utm_medium text;
alter table public.leads add column if not exists utm_campaign text;
alter table public.leads add column if not exists utm_term text;
alter table public.leads add column if not exists utm_content text;
alter table public.leads add column if not exists referrer text;
alter table public.leads add column if not exists landing_path text;
alter table public.leads add column if not exists ip text;
alter table public.leads add column if not exists user_agent text;
alter table public.leads add column if not exists ref_code text;

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table public.affiliate_tiers     enable row level security;
alter table public.affiliates          enable row level security;
alter table public.affiliate_payouts   enable row level security;

-- Tiers are public (shown on the affiliate dashboard).
drop policy if exists "Affiliate tiers are public" on public.affiliate_tiers;
create policy "Affiliate tiers are public" on public.affiliate_tiers
  for select using (true);

-- Affiliates can read their own profile.
drop policy if exists "Affiliate reads own profile" on public.affiliates;
create policy "Affiliate reads own profile" on public.affiliates
  for select using (auth.uid() = user_id);

-- Affiliates can read their own payouts.
drop policy if exists "Affiliate reads own payouts" on public.affiliate_payouts;
create policy "Affiliate reads own payouts" on public.affiliate_payouts
  for select using (auth.uid() = affiliate_user_id);

-- (All writes happen through the service-role admin client, which bypasses RLS.)

-- ── Seed a default tier ladder (only if empty) ───────────────────────────────
insert into public.affiliate_tiers (name, min_sales, cash_percent, self_discount_percent, sort_order)
select * from (values
  ('Standard', 0,  20, 10, 0),
  ('Bronze',  10, 22, 12, 1),
  ('Silber',  20, 25, 15, 2),
  ('Gold',    50, 30, 20, 3)
) as v(name, min_sales, cash_percent, self_discount_percent, sort_order)
where not exists (select 1 from public.affiliate_tiers);
