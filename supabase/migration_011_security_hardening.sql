-- Migration 011: Security hardening
-- 1) Gate lesson content (video_url, resources) behind paid purchases.
-- 2) Rate-limit bucket table (service-role only, no public policies).

-- ── Lessons: replace public read with buyer-only read ──
drop policy if exists "Lessons are public through active courses" on public.lessons;

create policy "Lessons readable by course buyers" on public.lessons
  for select using (
    exists (
      select 1
      from public.modules m
      join public.courses c on c.id = m.course_id
      join public.purchases p on p.course_slug = c.slug
      where m.id = public.lessons.module_id
        and c.is_active = true
        and p.user_id = auth.uid()
        and p.status = 'paid'
    )
  );

-- ── Rate limits (API abuse protection via service role) ──
create table if not exists public.rate_limits (
  key text primary key,
  count integer not null default 1,
  window_start timestamptz not null default now()
);

alter table public.rate_limits enable row level security;
-- Intentionally no policies: only the service-role client may read/write.
