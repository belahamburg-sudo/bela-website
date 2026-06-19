-- Link courses to real Stripe products/prices so the admin can create them on
-- a button press (catalog + per-product reporting in Stripe). Checkout keeps
-- the DB price authoritative and just attributes the line to the product.
alter table public.courses
  add column if not exists stripe_product_id text,
  add column if not exists stripe_price_id text;
