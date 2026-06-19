-- ───────────────────────────────────────────────────────────────────────────
-- Migration 019: Freebies / lead magnets (unlisted courses)
--
-- An "unlisted" course is a free lead magnet: it is hidden from the public
-- catalog and the member store, and only shows up in a member's library after
-- they claim it via /freebie/[slug] (which also opts them into the newsletter).
--
-- Idempotent. Run in the Supabase SQL editor.
-- ───────────────────────────────────────────────────────────────────────────

alter table public.courses
  add column if not exists is_unlisted boolean not null default false;

drop policy if exists "Active courses are public" on public.courses;
drop policy if exists "Active listed courses are public" on public.courses;
create policy "Active listed courses are public" on public.courses
  for select using (is_active = true and is_unlisted = false);

drop policy if exists "Purchased courses are readable by owner" on public.courses;
create policy "Purchased courses are readable by owner" on public.courses
  for select using (
    exists (
      select 1 from public.purchases p
      where p.course_slug = public.courses.slug
        and p.user_id = auth.uid()
        and p.status in ('paid', 'free')
    )
  );

drop policy if exists "Modules are public through active courses" on public.modules;
drop policy if exists "Modules are public through active listed courses" on public.modules;
create policy "Modules are public through active listed courses" on public.modules
  for select using (
    exists (
      select 1 from public.courses
      where public.courses.id = public.modules.course_id
        and public.courses.is_active = true
        and public.courses.is_unlisted = false
    )
  );

drop policy if exists "Modules readable by course buyers" on public.modules;
create policy "Modules readable by course buyers" on public.modules
  for select using (
    exists (
      select 1
      from public.courses c
      join public.purchases p on p.course_slug = c.slug
      where c.id = public.modules.course_id
        and c.is_active = true
        and p.user_id = auth.uid()
        and p.status in ('paid', 'free')
    )
  );

drop policy if exists "Lessons readable by course buyers" on public.lessons;
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
        and p.status in ('paid', 'free')
    )
  );
