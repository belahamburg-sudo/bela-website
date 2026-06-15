-- ───────────────────────────────────────────────────────────────────────────
-- Migration 014: Course bundles / cross-grants
--
-- A course can grant access to OTHER courses when it's purchased. This powers
-- both:
--   1) Bundles  — a (Bundle-level) course that includes several other courses.
--   2) Linking  — "buy course A, get course B as a bonus" (one-directional).
--
-- It's a single, one-sided list of course slugs unlocked alongside this course.
-- The Stripe webhook expands these on purchase (inserts paid, 0€ purchase rows
-- for each included course), so all existing entitlement checks keep working.
--
-- Idempotent. Run in the Supabase SQL editor.
-- ───────────────────────────────────────────────────────────────────────────

alter table public.courses
  add column if not exists bundled_courses jsonb not null default '[]'::jsonb;
