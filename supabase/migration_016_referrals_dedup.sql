-- ───────────────────────────────────────────────────────────────────────────
-- Migration 016: De-duplicate affiliate commissions
--
-- A replayed or concurrently-delivered Stripe `checkout.session.completed`
-- event could insert two `referrals` rows for the SAME purchase, double-counting
-- an affiliate's commission. This unique index makes the second insert a no-op
-- (the webhook logs and ignores the error). Partial so the many legitimate NULL
-- purchase_id rows (referrals not tied to a specific purchase) stay allowed.
--
-- Safe to run on existing data UNLESS duplicates already exist — see the check
-- below; if it reports rows, delete the extras first, then create the index.
--
-- Idempotent. Run in the Supabase SQL editor.
-- ───────────────────────────────────────────────────────────────────────────

-- 1) Optional safety check — should return 0 rows. If it returns any, there are
--    existing duplicates to clean up before the unique index can be created.
-- select purchase_id, count(*) from public.referrals
-- where purchase_id is not null group by purchase_id having count(*) > 1;

-- 2) The de-dup guard.
create unique index if not exists referrals_purchase_unique
  on public.referrals (purchase_id)
  where purchase_id is not null;
