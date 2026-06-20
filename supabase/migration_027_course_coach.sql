-- ───────────────────────────────────────────────────────────────────────────
-- Migration 027: AI-Kurs-Coach (RAG over course content)
--
-- pgvector store of course-content chunks + a similarity-search function. Only
-- the service role writes/reads this (ingestion admin action + coach API), so
-- RLS is enabled with NO client policies (deny-all to anon/authenticated).
--
-- Embedding dimension is 1024 to match ZAI `embedding-2` (lib/zai.ts). If you
-- change the embedding model, change vector(1024) here AND ZAI_EMBED_DIM.
-- No vector index: per-course chunk counts are small, so a sequential scan is
-- fine and avoids pgvector's 2000-dim index limit. Idempotent.
-- ───────────────────────────────────────────────────────────────────────────

create extension if not exists vector;

create table if not exists public.course_chunks (
  id uuid primary key default gen_random_uuid(),
  course_slug text not null,
  lesson_id uuid,
  title text,
  content text not null,
  embedding vector(1024),
  created_at timestamptz not null default now()
);

create index if not exists course_chunks_slug_idx on public.course_chunks (course_slug);

alter table public.course_chunks enable row level security;

create or replace function public.match_course_chunks(
  p_course_slug text,
  query_embedding vector(1024),
  match_count int default 6
)
returns table (id uuid, lesson_id uuid, title text, content text, similarity float)
language sql
stable
as $$
  select c.id, c.lesson_id, c.title, c.content,
         1 - (c.embedding <=> query_embedding) as similarity
  from public.course_chunks c
  where c.course_slug = p_course_slug
    and c.embedding is not null
  order by c.embedding <=> query_embedding
  limit match_count;
$$;

revoke all on function public.match_course_chunks(text, vector, int) from public;
grant execute on function public.match_course_chunks(text, vector, int) to service_role;
