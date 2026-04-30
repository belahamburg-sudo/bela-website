create table if not exists public.member_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  selected_avatar text not null default 'miner-01',
  points integer not null default 0,
  level integer not null default 1,
  purchased_courses integer not null default 0,
  completed_lessons integer not null default 0,
  completed_courses integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.member_rewards (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reward_key text not null,
  unlocked_at timestamptz not null default now(),
  unique(user_id, reward_key)
);

alter table public.member_state enable row level security;
alter table public.member_rewards enable row level security;

create policy "Member state is readable by owner" on public.member_state
  for select using (auth.uid() = user_id);

create policy "Member state is insertable by owner" on public.member_state
  for insert with check (auth.uid() = user_id);

create policy "Member state is editable by owner" on public.member_state
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Member rewards are readable by owner" on public.member_rewards
  for select using (auth.uid() = user_id);

create policy "Member rewards are insertable by owner" on public.member_rewards
  for insert with check (auth.uid() = user_id);
