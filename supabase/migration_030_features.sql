-- Migration 030: Quizzes, Comments, Notifications, Support Tickets, Waitlist, Drip Content, Installments
-- All tables use RLS; most are service-role-only or user-scoped.

-- ═══════════════════════════════════════════════════════════════════
-- 1. QUIZZES
-- ═══════════════════════════════════════════════════════════════════

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  question text not null,
  options jsonb not null default '[]',
  explanation text,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists quiz_questions_module on public.quiz_questions(module_id);
alter table public.quiz_questions enable row level security;

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  module_id uuid not null references public.modules(id) on delete cascade,
  score int not null default 0,
  total int not null default 0,
  answers jsonb not null default '[]',
  passed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists quiz_attempts_user_module on public.quiz_attempts(user_id, module_id);
alter table public.quiz_attempts enable row level security;

create policy "Users read own quiz attempts" on public.quiz_attempts
  for select using (auth.uid() = user_id);
create policy "Users insert own quiz attempts" on public.quiz_attempts
  for insert with check (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════
-- 2. LESSON COMMENTS
-- ═══════════════════════════════════════════════════════════════════

create table if not exists public.lesson_comments (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  user_id uuid not null,
  parent_id uuid references public.lesson_comments(id) on delete cascade,
  content text not null,
  is_pinned boolean not null default false,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create index if not exists lesson_comments_lesson on public.lesson_comments(lesson_id, created_at);
create index if not exists lesson_comments_user on public.lesson_comments(user_id);
alter table public.lesson_comments enable row level security;

create policy "Anyone reads non-deleted comments" on public.lesson_comments
  for select using (not is_deleted);
create policy "Users insert own comments" on public.lesson_comments
  for insert with check (auth.uid() = user_id);
create policy "Users update own comments" on public.lesson_comments
  for update using (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════
-- 3. NOTIFICATIONS
-- ═══════════════════════════════════════════════════════════════════

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  type text not null,
  title text not null,
  body text,
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_unread on public.notifications(user_id, read, created_at desc);
alter table public.notifications enable row level security;

create policy "Users read own notifications" on public.notifications
  for select using (auth.uid() = user_id);
create policy "Users update own notifications" on public.notifications
  for update using (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════
-- 4. SUPPORT TICKETS
-- ═══════════════════════════════════════════════════════════════════

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  email text not null,
  subject text not null,
  status text not null default 'open',
  priority text not null default 'normal',
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create index if not exists support_tickets_user on public.support_tickets(user_id);
create index if not exists support_tickets_status on public.support_tickets(status);
alter table public.support_tickets enable row level security;

create policy "Users read own tickets" on public.support_tickets
  for select using (auth.uid() = user_id);
create policy "Users create own tickets" on public.support_tickets
  for insert with check (auth.uid() = user_id);

create table if not exists public.ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  sender_id uuid,
  is_admin boolean not null default false,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists ticket_messages_ticket on public.ticket_messages(ticket_id, created_at);
alter table public.ticket_messages enable row level security;

create policy "Users read messages of own tickets" on public.ticket_messages
  for select using (
    exists (select 1 from public.support_tickets t where t.id = ticket_id and t.user_id = auth.uid())
  );
create policy "Users insert messages on own tickets" on public.ticket_messages
  for insert with check (
    auth.uid() = sender_id and
    exists (select 1 from public.support_tickets t where t.id = ticket_id and t.user_id = auth.uid())
  );

-- ═══════════════════════════════════════════════════════════════════
-- 5. WAITLIST
-- ═══════════════════════════════════════════════════════════════════

create table if not exists public.course_waitlist (
  id uuid primary key default gen_random_uuid(),
  course_slug text not null,
  email text not null,
  name text,
  notified boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index if not exists waitlist_course_email on public.course_waitlist(course_slug, email);
alter table public.course_waitlist enable row level security;

-- ═══════════════════════════════════════════════════════════════════
-- 6. DRIP CONTENT (add columns to existing tables)
-- ═══════════════════════════════════════════════════════════════════

alter table public.courses add column if not exists drip_enabled boolean not null default false;
alter table public.modules add column if not exists drip_days int;

-- ═══════════════════════════════════════════════════════════════════
-- 7. INSTALLMENT SUPPORT (add columns to existing courses)
-- ═══════════════════════════════════════════════════════════════════

alter table public.courses add column if not exists installment_count int;
alter table public.courses add column if not exists installment_price_cents int;
