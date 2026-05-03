alter table public.profiles
  add column if not exists business_snapshot jsonb not null default '{}'::jsonb;
