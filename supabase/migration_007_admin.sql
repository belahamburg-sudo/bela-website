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
