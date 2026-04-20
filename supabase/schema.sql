create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default uuid_generate_v4(),
  email text not null,
  name text,
  source text not null check (source in ('newsletter', 'webinar', 'community')),
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  title text not null,
  tagline text,
  description text,
  price_cents integer not null default 0,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.modules (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  position integer not null default 0
);

create table if not exists public.lessons (
  id uuid primary key default uuid_generate_v4(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  description text,
  video_url text,
  duration text,
  position integer not null default 0,
  -- resources shape: [{ "label": string, "type": "PDF" | "Template" | "Prompt", "href": string }]
  resources jsonb not null default '[]'::jsonb
);

create table if not exists public.purchases (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  course_slug text not null,
  stripe_session_id text unique,
  stripe_customer_id text,
  amount_total integer,
  currency text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.lesson_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique(user_id, lesson_id)
);

alter table public.profiles enable row level security;
alter table public.leads enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.purchases enable row level security;
alter table public.lesson_progress enable row level security;

create policy "Profiles are readable by owner" on public.profiles
  for select using (auth.uid() = id);

create policy "Profiles are editable by owner" on public.profiles
  for update using (auth.uid() = id);

create policy "Active courses are public" on public.courses
  for select using (is_active = true);

create policy "Modules are public through active courses" on public.modules
  for select using (
    exists (
      select 1 from public.courses
      where public.courses.id = public.modules.course_id
      and public.courses.is_active = true
    )
  );

create policy "Lessons are public through active courses" on public.lessons
  for select using (
    exists (
      select 1 from public.modules
      join public.courses on public.courses.id = public.modules.course_id
      where public.modules.id = public.lessons.module_id
      and public.courses.is_active = true
    )
  );

create policy "Purchases are readable by owner" on public.purchases
  for select using (auth.uid() = user_id);

create policy "Progress is owned by user" on public.lesson_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Inserts into leads and purchases are intended to happen through server-side service role API routes.
