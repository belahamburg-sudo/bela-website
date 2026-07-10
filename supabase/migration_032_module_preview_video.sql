-- Per-module preview video shown on the PUBLIC product page, next to the
-- module's sales bullets ("Kursinhalt im Detail"). This is a marketing teaser
-- stored as a public URL (media bucket or external embed) — distinct from the
-- private, paywalled lesson videos. Optional: modules without one just show
-- their bullets as before.
alter table public.modules
  add column if not exists preview_video_url text;
