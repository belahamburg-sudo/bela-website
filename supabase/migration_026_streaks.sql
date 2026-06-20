-- ───────────────────────────────────────────────────────────────────────────
-- Migration 026: Login streaks (Gamification 2.0)
--
-- Adds streak tracking to member_state. Updated server-side (service role) on
-- each member-area load via syncMemberState; read by the dashboard gamification
-- panel + the "3-Tage-Streak" quest. Idempotent.
-- ───────────────────────────────────────────────────────────────────────────

alter table public.member_state
  add column if not exists current_streak integer not null default 0,
  add column if not exists longest_streak integer not null default 0,
  add column if not exists last_active_on date;
