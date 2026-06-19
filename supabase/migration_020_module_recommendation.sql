-- Per-module course recommendation.
-- Lets the admin point members to another course after they finish a module
-- ("Nach Modul 4: schau dir den AI Nischenfinder an"). Both columns are
-- optional — a module with no recommendation behaves exactly as before.
alter table public.modules
  add column if not exists recommended_course_slug text,
  add column if not exists recommendation_note text;
