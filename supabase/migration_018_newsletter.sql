-- ───────────────────────────────────────────────────────────────────────────
-- Migration 018: Newsletter subscribers with double-opt-in (DOI)
--
-- Marketing emails need explicit, confirmed consent. A subscriber starts as
-- 'pending' with a confirm_token; the link in the DOI email flips it to
-- 'confirmed'. Unsubscribe flips it to 'unsubscribed'. Service-role only (no
-- RLS policies) — all access goes through server routes.
--
-- Idempotent. Run in the Supabase SQL editor.
-- ───────────────────────────────────────────────────────────────────────────

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending',        -- pending | confirmed | unsubscribed
  confirm_token text,
  source text,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  unsubscribed_at timestamptz
);

create index if not exists newsletter_subscribers_user_id_idx
  on public.newsletter_subscribers (user_id);
create index if not exists newsletter_subscribers_token_idx
  on public.newsletter_subscribers (confirm_token);

alter table public.newsletter_subscribers enable row level security;
