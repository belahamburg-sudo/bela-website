-- Migration 023 — persistent Stripe coupon/promotion code per affiliate code
--
-- When an affiliate is created (or issues a coupon), we now create a real Stripe
-- coupon + promotion code so the buyer can type the code (e.g. ELMO) directly in
-- checkout and get the per-code discount. These columns store the Stripe IDs so
-- we can apply the persistent promotion code and retire an outdated one when the
-- discount changes.
--
-- Additive and safe to run on the live DB.

alter table public.referral_codes
  add column if not exists stripe_coupon_id text,
  add column if not exists stripe_promotion_code_id text;
