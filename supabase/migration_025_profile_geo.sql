-- ───────────────────────────────────────────────────────────────────────────
-- Migration 025: Profile geo-coordinates (for the VIP world map)
--
-- Caches lat/lng resolved from the free-text `city` so the VIP "Goldminer
-- weltweit" map can plot members without geocoding on every page load.
-- geocoded_at is set even on a failed lookup so we don't retry a bad city
-- forever. No RLS change: these are written server-side (service role) and read
-- only in aggregate (city + count, no names).
-- Idempotent.
-- ───────────────────────────────────────────────────────────────────────────

alter table public.profiles
  add column if not exists lat double precision,
  add column if not exists lng double precision,
  add column if not exists geocoded_at timestamptz;
