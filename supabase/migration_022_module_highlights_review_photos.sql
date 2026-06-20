-- Migration 022 — sales-page extras
--
-- 1. modules.highlights: 3–5 bullet points per module, shown in the "Kursinhalt
--    im Detail" section of the public product page (one block per module).
-- 2. course_reviews.photo_url: optional avatar/photo for a testimonial. Lets the
--    admin add in-house testimonials with a face next to the quote; user-written
--    reviews keep working unchanged (photo stays null).
--
-- Both are additive and safe to run on the live DB.

alter table public.modules
  add column if not exists highlights jsonb not null default '[]'::jsonb;

alter table public.course_reviews
  add column if not exists photo_url text;
