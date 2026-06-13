-- ───────────────────────────────────────────────────────────────────────────
-- Migration 008: cart (multi-course sessions), referrals/affiliates, course
-- reviews, and watermarked-download logging.
-- ───────────────────────────────────────────────────────────────────────────

-- 1) Allow a single Stripe Checkout Session to grant multiple courses (cart).
alter table public.purchases drop constraint if exists purchases_stripe_session_id_key;
create unique index if not exists purchases_session_course_unique
  on public.purchases (stripe_session_id, course_slug);

-- 2) Referral / affiliate codes.
--    A referral code belongs to a user (member "refer a friend" or a paid
--    affiliate who resells courses). Attribution is recorded per purchase.
create table if not exists public.referral_codes (
  code text primary key,
  user_id uuid references auth.users(id) on delete set null,
  kind text not null default 'referral' check (kind in ('referral', 'affiliate')),
  -- percentage the referred friend gets off (brief: 20%)
  discount_percent integer not null default 20,
  -- percentage commission the affiliate earns
  commission_percent integer not null default 20,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.referrals (
  id uuid primary key default uuid_generate_v4(),
  code text references public.referral_codes(code) on delete set null,
  referrer_user_id uuid references auth.users(id) on delete set null,
  referred_user_id uuid references auth.users(id) on delete set null,
  purchase_id uuid references public.purchases(id) on delete set null,
  amount_total integer,
  commission_cents integer,
  -- 'pending' until paid out, then 'approved' / 'paid'
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

-- 3) Course reviews / ratings (brief section 3: Bewertungsfunktion unter den Kursen).
create table if not exists public.course_reviews (
  id uuid primary key default uuid_generate_v4(),
  course_slug text not null,
  user_id uuid references auth.users(id) on delete set null,
  author_name text,
  rating integer not null check (rating between 1 and 5),
  title text,
  body text,
  -- only buyers can leave verified reviews
  is_verified boolean not null default false,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  unique (course_slug, user_id)
);

-- 4) Watermarked download log (brief section 2, step 6: who / when / IP).
create table if not exists public.download_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  course_slug text,
  resource_label text,
  storage_path text,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);

-- RLS ----------------------------------------------------------------------
alter table public.referral_codes enable row level security;
alter table public.referrals enable row level security;
alter table public.course_reviews enable row level security;
alter table public.download_logs enable row level security;

-- Anyone may read active referral codes (needed to validate a typed code).
drop policy if exists "Referral codes readable" on public.referral_codes;
create policy "Referral codes readable" on public.referral_codes
  for select using (is_active = true);

-- A user can read their own referral attributions.
drop policy if exists "Referrals readable by referrer" on public.referrals;
create policy "Referrals readable by referrer" on public.referrals
  for select using (auth.uid() = referrer_user_id);

-- Published reviews are public; users manage their own.
drop policy if exists "Published reviews are public" on public.course_reviews;
create policy "Published reviews are public" on public.course_reviews
  for select using (is_published = true);

drop policy if exists "Users insert own review" on public.course_reviews;
create policy "Users insert own review" on public.course_reviews
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users update own review" on public.course_reviews;
create policy "Users update own review" on public.course_reviews
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Download logs are readable by their owner; writes happen via service role.
drop policy if exists "Download logs readable by owner" on public.download_logs;
create policy "Download logs readable by owner" on public.download_logs
  for select using (auth.uid() = user_id);
