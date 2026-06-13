-- ════════════════════════════════════════════════════════════════════════
-- AI GOLDMINING — GO LIVE
-- Paste this whole file into Supabase → SQL Editor → Run (once).
-- It applies migration 007 (course columns + admin), 008 (cart/reviews/
-- referrals/downloads) and 009 (seed "51 AI Business Ideen" + hide demos).
-- All statements are idempotent — safe to run again.
-- ════════════════════════════════════════════════════════════════════════

-- ========== migration_007_admin.sql ==========
-- Migration 007: Admin control center
-- Adds marketing-fidelity columns to courses (so the DB can fully drive the
-- public site), plus tables for site settings, webinars, an audit log and
-- email broadcasts. Storage buckets are created lazily from the app via the
-- service-role client (see lib/storage.ts), so no storage SQL is required here.

-- ── Courses: extra columns the static catalog had but the table lacked ──
alter table public.courses add column if not exists level text;
alter table public.courses add column if not exists format text not null default 'video';
alter table public.courses add column if not exists audience text;
alter table public.courses add column if not exists outcome text;
alter table public.courses add column if not exists featured boolean not null default false;
alter table public.courses add column if not exists includes jsonb not null default '[]'::jsonb;
alter table public.courses add column if not exists sort_order integer not null default 0;
alter table public.courses add column if not exists updated_at timestamptz not null default now();

-- ── Lessons: optional summary kept separate from description is not needed;
--    the existing description column already holds the lesson summary. ──

-- ── Site settings: simple key/value store for global config ──
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ── Webinars: the upcoming-webinar data shown in the hero / webinar page ──
create table if not exists public.webinars (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  subtitle text,
  description text,
  starts_at timestamptz,
  url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Audit log: who changed what in the admin ──
create table if not exists public.audit_log (
  id uuid primary key default uuid_generate_v4(),
  actor_email text,
  action text not null,
  entity text,
  entity_id text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ── Email broadcasts: log of bulk sends from the admin ──
create table if not exists public.email_broadcasts (
  id uuid primary key default uuid_generate_v4(),
  subject text,
  template text not null,
  segment text,
  recipient_count integer not null default 0,
  status text not null default 'sent',
  created_at timestamptz not null default now()
);

-- ── RLS ──
-- site_settings and webinars are read by the public marketing site (anon),
-- but only written by the service-role admin client (which bypasses RLS).
alter table public.site_settings enable row level security;
alter table public.webinars enable row level security;
alter table public.audit_log enable row level security;
alter table public.email_broadcasts enable row level security;

drop policy if exists "Site settings are public" on public.site_settings;
create policy "Site settings are public" on public.site_settings
  for select using (true);

drop policy if exists "Active webinars are public" on public.webinars;
create policy "Active webinars are public" on public.webinars
  for select using (is_active = true);

-- audit_log and email_broadcasts have no public policies: only the
-- service-role admin client can read/write them.

-- Seed a single default webinar row if none exists (keeps the hero populated).
insert into public.webinars (title, subtitle, description, starts_at, url, is_active)
select
  'Nächstes Webinar',
  'Live Webinar',
  'Ich zeige dir, wie du mit AI digitale Produkte baust und automatisiert verkaufst.',
  now() + interval '7 days',
  '/webinar#anmeldung',
  true
where not exists (select 1 from public.webinars);


-- ========== migration_008_cart_referrals_reviews_downloads.sql ==========
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


-- ========== migration_009_seed_51_ai_business_ideen.sql ==========
-- ───────────────────────────────────────────────────────────────────────────
-- Migration 009: Go live with the first real course — "51 AI Business Ideen".
-- Files already uploaded to Storage:
--   cover  -> media/courses/51-ai-business-ideen/cover.jpg            (public)
--   pdf    -> course-content/courses/51-ai-business-ideen/...pdf      (private)
-- Requires migration_007 (extended course columns) to be applied first.
-- Idempotent: safe to run more than once.
-- ───────────────────────────────────────────────────────────────────────────

-- Safety: ensure the lesson resources column exists (base schema / migration 003).
alter table public.lessons add column if not exists resources jsonb not null default '[]'::jsonb;

-- ── The course ──
insert into public.courses
  (slug, title, tagline, description, price_cents, image_url, is_active,
   level, format, audience, outcome, featured, includes, sort_order)
values (
  '51-ai-business-ideen',
  '51 AI Business Ideen',
  'Die Karte zum Goldfeld',
  'Einundfünfzig reale Wege, mit Künstlicher Intelligenz Geld zu verdienen. Jede Idee mit Verdienst-Range, Erfahrungslevel, Kategorie und Zukunftsprognose. Du sollst nicht alles machen — du sollst eine wählen.',
  1900,
  'https://hshkumoipyfocqnhqbql.supabase.co/storage/v1/object/public/media/courses/51-ai-business-ideen/cover.jpg',
  true,
  'Start',
  'pdf',
  'Einsteiger, die eine konkrete, profitable AI-Idee suchen',
  '51 geprüfte AI-Geschäftsideen mit Verdienst-Range, Level und Zukunftsprognose — als sofort nutzbarer PDF-Katalog.',
  true,
  '["51 reale AI-Geschäftsideen","Verdienst-Range pro Idee","Erfahrungslevel & Kategorie-Tag","Zukunftsprognose pro Markt"]'::jsonb,
  0
)
on conflict (slug) do update set
  title       = excluded.title,
  tagline     = excluded.tagline,
  description = excluded.description,
  price_cents = excluded.price_cents,
  image_url   = excluded.image_url,
  is_active   = true,
  level       = excluded.level,
  format      = excluded.format,
  audience    = excluded.audience,
  outcome     = excluded.outcome,
  featured    = excluded.featured,
  includes    = excluded.includes,
  sort_order  = excluded.sort_order;

-- ── One module ──
insert into public.modules (course_id, title, position)
select c.id, 'Der Katalog', 0
from public.courses c
where c.slug = '51-ai-business-ideen'
  and not exists (
    select 1 from public.modules m where m.course_id = c.id and m.title = 'Der Katalog'
  );

-- ── One lesson with the watermarked PDF as a downloadable resource ──
insert into public.lessons (module_id, title, description, video_url, duration, position, resources)
select
  m.id,
  '51 AI Business Ideen — komplettes PDF',
  'Der vollständige Katalog mit 51 AI-Geschäftsideen, jeweils mit Verdienst-Range, Level, Kategorie und Zukunftsprognose.',
  null,
  'PDF',
  0,
  '[{"label":"51 AI Business Ideen (PDF)","type":"PDF","href":"storage://course-content/courses/51-ai-business-ideen/51-ai-business-ideen.pdf"}]'::jsonb
from public.modules m
join public.courses c on c.id = m.course_id
where c.slug = '51-ai-business-ideen' and m.title = 'Der Katalog'
  and not exists (
    select 1 from public.lessons l
    where l.module_id = m.id and l.title = '51 AI Business Ideen — komplettes PDF'
  );

-- ── Hide the 5 demo placeholder courses (rickroll videos) ──
update public.courses set is_active = false
where slug in (
  'ai-goldmining-starter',
  'template-goldmine',
  'mini-kurs-maschine',
  'funnel-store-system',
  'ai-goldmining-starter-pack'
);
