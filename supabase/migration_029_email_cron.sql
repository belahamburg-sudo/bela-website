-- Migration 029: email_cron_log — deduplication for scheduled emails
--
-- Each cron run (checkout-abandoned, webinar-reminder, re-engagement) records
-- which emails it sent so the next run never double-sends. The (job, recipient,
-- entity_id) triple is unique.

create table if not exists public.email_cron_log (
  id uuid primary key default gen_random_uuid(),
  job text not null,
  recipient text not null,
  entity_id text not null default '',
  sent_at timestamptz not null default now()
);

create unique index if not exists email_cron_log_dedup
  on public.email_cron_log (job, recipient, entity_id);

create index if not exists email_cron_log_job_sent
  on public.email_cron_log (job, sent_at);

alter table public.email_cron_log enable row level security;
-- No public policies — only the service-role admin client writes/reads.
