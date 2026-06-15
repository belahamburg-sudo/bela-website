-- Telegram bot linkage for paid group access control.
alter table public.telegram_subscriptions
  add column if not exists telegram_user_id bigint,
  add column if not exists telegram_username text;

create index if not exists telegram_subscriptions_telegram_user_id_idx
  on public.telegram_subscriptions (telegram_user_id)
  where telegram_user_id is not null;
