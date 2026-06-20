-- ───────────────────────────────────────────────────────────────────────────
-- Migration 028: Certificate collection tracking
--
-- Records when a member has downloaded (collected) a course certificate, so the
-- dashboard can show an "abholen" banner only until it's been collected.
-- Written by the service role (the /api/certificate route on download); members
-- may read their own. Idempotent.
-- ───────────────────────────────────────────────────────────────────────────

create table if not exists public.certificates (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_slug text not null,
  issued_at timestamptz not null default now(),
  primary key (user_id, course_slug)
);

alter table public.certificates enable row level security;

drop policy if exists "Certificates readable by owner" on public.certificates;
create policy "Certificates readable by owner" on public.certificates
  for select using (auth.uid() = user_id);
