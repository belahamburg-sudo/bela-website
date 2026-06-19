-- ───────────────────────────────────────────────────────────────────────────
-- Migration 017: Rich product pages, anchor pricing, promo video, cross-sell
--
-- Turns each course into a fully editable sales asset. All columns are additive,
-- nullable / sensibly defaulted, and read best-effort by the app, so the live
-- site keeps working before this runs and the admin keeps saving on an
-- un-migrated DB (the writer ignores "column does not exist" for these).
--
--   compare_at_price_cents — strikethrough "anchor" price; a "-X% OFF" badge is
--                            derived when price_cents is lower.
--   promo_video_url        — short promo video shown on the product page
--                            (separate from the cover image).
--   cross_sell_slugs       — hand-picked cross-sell courses shown under videos.
--   affiliate_text         — per-course affiliate/tools text shown under videos.
--   product_page           — flexible JSON blob holding the editable sales-page
--                            sections (problem, vision, mechanic, who-for, …).
--                            Empty / missing keys simply hide their section.
--
-- Idempotent. Run in the Supabase SQL editor.
-- ───────────────────────────────────────────────────────────────────────────

alter table public.courses
  add column if not exists compare_at_price_cents integer,
  add column if not exists promo_video_url text,
  add column if not exists cross_sell_slugs jsonb not null default '[]'::jsonb,
  add column if not exists affiliate_text text,
  add column if not exists product_page jsonb not null default '{}'::jsonb;
