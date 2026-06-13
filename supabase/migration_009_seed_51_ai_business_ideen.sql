-- ───────────────────────────────────────────────────────────────────────────
-- Migration 009: Go live with the first real course — "51 AI Business Ideen".
-- Files already uploaded to Storage:
--   cover  -> media/courses/51-ai-business-ideen/cover.jpg            (public)
--   pdf    -> course-content/courses/51-ai-business-ideen/...pdf      (private)
-- Requires migration_007 (extended course columns) to be applied first.
-- Idempotent: safe to run more than once.
-- ───────────────────────────────────────────────────────────────────────────

-- Safety: ensure the lesson resources column exists (base schema / migration 003).
alter table public.lessons add column if not exists resources jsonb not null default '[]'::jsonb;

-- ── The course ──
insert into public.courses
  (slug, title, tagline, description, price_cents, image_url, is_active,
   level, format, audience, outcome, featured, includes, sort_order)
values (
  '51-ai-business-ideen',
  '51 AI Business Ideen',
  'Die Karte zum Goldfeld',
  'Einundfünfzig reale Wege, mit Künstlicher Intelligenz Geld zu verdienen. Jede Idee mit Verdienst-Range, Erfahrungslevel, Kategorie und Zukunftsprognose. Du sollst nicht alles machen — du sollst eine wählen.',
  1900,
  'https://hshkumoipyfocqnhqbql.supabase.co/storage/v1/object/public/media/courses/51-ai-business-ideen/cover.jpg',
  true,
  'Start',
  'pdf',
  'Einsteiger, die eine konkrete, profitable AI-Idee suchen',
  '51 geprüfte AI-Geschäftsideen mit Verdienst-Range, Level und Zukunftsprognose — als sofort nutzbarer PDF-Katalog.',
  true,
  '["51 reale AI-Geschäftsideen","Verdienst-Range pro Idee","Erfahrungslevel & Kategorie-Tag","Zukunftsprognose pro Markt"]'::jsonb,
  0
)
on conflict (slug) do update set
  title       = excluded.title,
  tagline     = excluded.tagline,
  description = excluded.description,
  price_cents = excluded.price_cents,
  image_url   = excluded.image_url,
  is_active   = true,
  level       = excluded.level,
  format      = excluded.format,
  audience    = excluded.audience,
  outcome     = excluded.outcome,
  featured    = excluded.featured,
  includes    = excluded.includes,
  sort_order  = excluded.sort_order;

-- ── One module ──
insert into public.modules (course_id, title, position)
select c.id, 'Der Katalog', 0
from public.courses c
where c.slug = '51-ai-business-ideen'
  and not exists (
    select 1 from public.modules m where m.course_id = c.id and m.title = 'Der Katalog'
  );

-- ── One lesson with the watermarked PDF as a downloadable resource ──
insert into public.lessons (module_id, title, description, video_url, duration, position, resources)
select
  m.id,
  '51 AI Business Ideen — komplettes PDF',
  'Der vollständige Katalog mit 51 AI-Geschäftsideen, jeweils mit Verdienst-Range, Level, Kategorie und Zukunftsprognose.',
  null,
  'PDF',
  0,
  '[{"label":"51 AI Business Ideen (PDF)","type":"PDF","href":"storage://course-content/courses/51-ai-business-ideen/51-ai-business-ideen.pdf"}]'::jsonb
from public.modules m
join public.courses c on c.id = m.course_id
where c.slug = '51-ai-business-ideen' and m.title = 'Der Katalog'
  and not exists (
    select 1 from public.lessons l
    where l.module_id = m.id and l.title = '51 AI Business Ideen — komplettes PDF'
  );

-- ── Hide the 5 demo placeholder courses (rickroll videos) ──
update public.courses set is_active = false
where slug in (
  'ai-goldmining-starter',
  'template-goldmine',
  'mini-kurs-maschine',
  'funnel-store-system',
  'ai-goldmining-starter-pack'
);
