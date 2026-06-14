-- ───────────────────────────────────────────────────────────────────────────
-- Migration 010: Seed the full course catalog from the Google Drive
-- "AI Goldmining Kurse" folder (13 courses).
--
-- State of the Drive folder (2026-06-15):
--   • 4 folders have content (ALL PDF, no videos):
--       51 AI Business Ideen        -> already live via migration_009
--       Stan Store Masterclass      -> cover + 5 PDFs        (active here)
--       Stop Care Want More         -> cover + 1 PDF         (active here)
--       Rechtliches Digitale Prod.  -> cover + 3 PDF + 3 TXT (active here)
--   • 9 folders are EMPTY -> seeded as inactive placeholders (correct names only)
--
-- PREREQUISITE: the cover/PDF/TXT assets must be uploaded to Storage FIRST
-- (covers -> public `media` bucket, content -> private `course-content` bucket)
-- at the paths referenced below. Until then keep the 3 content courses inactive.
--
-- Requires migration_007 (extended course columns). Idempotent (on conflict).
-- Prices / taglines for the 9 placeholders are PLACEHOLDERS — adjust in admin.
-- ───────────────────────────────────────────────────────────────────────────

alter table public.lessons add column if not exists resources jsonb not null default '[]'::jsonb;

-- Supabase project: hshkumoipyfocqnhqbql
-- Cover URL pattern: https://hshkumoipyfocqnhqbql.supabase.co/storage/v1/object/public/media/courses/<slug>/cover.<ext>

-- ════════════════════════════════════════════════════════════════════════════
-- 1) CONTENT COURSES (real PDFs — active once assets are uploaded)
-- ════════════════════════════════════════════════════════════════════════════

-- ── Stan Store Masterclass ──────────────────────────────────────────────────
insert into public.courses
  (slug, title, tagline, description, price_cents, image_url, is_active,
   level, format, audience, outcome, featured, includes, sort_order)
values (
  'stan-store-masterclass',
  'Stan Store Masterclass',
  'Dein Stan Store, der verkauft',
  'Von Setup bis Verkauf: wie du deinen Stan Store sauber aufbaust, Produkte und Checkout einrichtest, das Design auf Conversion trimmst und die Produktübergabe automatisierst.',
  4900,
  'https://hshkumoipyfocqnhqbql.supabase.co/storage/v1/object/public/media/courses/stan-store-masterclass/cover.png',
  true, 'System', 'pdf',
  'Creator, die einen Store zum Verkaufen digitaler Produkte aufbauen wollen',
  'Ein fertig eingerichteter, verkaufsoptimierter Stan Store mit Produkten, Checkout und automatischer Auslieferung.',
  true,
  '["Stan Store Foundations","Produkte & Checkout aufsetzen","Storedesign & Promotion","Produktübergabe & Speicherung"]'::jsonb,
  40
)
on conflict (slug) do update set
  title=excluded.title, tagline=excluded.tagline, description=excluded.description,
  price_cents=excluded.price_cents, image_url=excluded.image_url, is_active=excluded.is_active,
  level=excluded.level, format=excluded.format, audience=excluded.audience,
  outcome=excluded.outcome, featured=excluded.featured, includes=excluded.includes,
  sort_order=excluded.sort_order;

insert into public.modules (course_id, title, position)
select c.id, 'Inhalte', 0 from public.courses c
where c.slug = 'stan-store-masterclass'
  and not exists (select 1 from public.modules m where m.course_id = c.id and m.title = 'Inhalte');

insert into public.lessons (module_id, title, description, video_url, duration, position, resources)
select m.id, v.title, v.descr, null, 'PDF', v.pos, v.res::jsonb
from public.modules m
join public.courses c on c.id = m.course_id and c.slug = 'stan-store-masterclass' and m.title = 'Inhalte'
join (values
  (0, 'Überblick', 'Was dich in der Stan Store Masterclass erwartet.', '[{"label":"Overview (PDF)","type":"PDF","href":"storage://course-content/courses/stan-store-masterclass/00_Overview_Stan_Store.pdf"}]'),
  (1, 'Stan Store Foundations', 'Die Grundlagen: Account, Struktur und erste Einrichtung.', '[{"label":"Foundations (PDF)","type":"PDF","href":"storage://course-content/courses/stan-store-masterclass/01_Stan_Store_Foundations.pdf"}]'),
  (2, 'Produkte & Checkout', 'Produkte anlegen und den Checkout sauber einrichten.', '[{"label":"Produkte & Checkout (PDF)","type":"PDF","href":"storage://course-content/courses/stan-store-masterclass/02_Produkte_und_Checkout.pdf"}]'),
  (3, 'Storedesign & Promotion', 'Design auf Conversion trimmen und den Store bewerben.', '[{"label":"Storedesign & Promotion (PDF)","type":"PDF","href":"storage://course-content/courses/stan-store-masterclass/03_Storedesign_und_Promotion.pdf"}]'),
  (4, 'Produktübergabe & Speicherung', 'Automatische Auslieferung und Speicherung der Produkte.', '[{"label":"Produktübergabe & Speicherung (PDF)","type":"PDF","href":"storage://course-content/courses/stan-store-masterclass/04_Produktuebergabe_und_Speicherung_Stan.pdf"}]')
) as v(pos, title, descr, res) on true
where not exists (select 1 from public.lessons l where l.module_id = m.id and l.title = v.title);

-- ── Stop Care Want More ─────────────────────────────────────────────────────
insert into public.courses
  (slug, title, tagline, description, price_cents, image_url, is_active,
   level, format, audience, outcome, featured, includes, sort_order)
values (
  'stop-care-want-more',
  'Stop Care Want More',
  'Das Content-Playbook',
  'Das Playbook für Content, der zieht: weniger gefallen wollen, mehr Wirkung. Hooks, Haltung und ein wiederholbarer Prozess für Content, der verkauft.',
  2900,
  'https://hshkumoipyfocqnhqbql.supabase.co/storage/v1/object/public/media/courses/stop-care-want-more/cover.png',
  true, 'Aufbau', 'pdf',
  'Creator, die mit Content sichtbar werden und verkaufen wollen',
  'Ein klares Content-Playbook mit Hooks, Haltung und wiederholbarem Prozess.',
  false,
  '["Content-Playbook (PDF)","Hooks & Haltung","Wiederholbarer Content-Prozess"]'::jsonb,
  60
)
on conflict (slug) do update set
  title=excluded.title, tagline=excluded.tagline, description=excluded.description,
  price_cents=excluded.price_cents, image_url=excluded.image_url, is_active=excluded.is_active,
  level=excluded.level, format=excluded.format, audience=excluded.audience,
  outcome=excluded.outcome, featured=excluded.featured, includes=excluded.includes,
  sort_order=excluded.sort_order;

insert into public.modules (course_id, title, position)
select c.id, 'Playbook', 0 from public.courses c
where c.slug = 'stop-care-want-more'
  and not exists (select 1 from public.modules m where m.course_id = c.id and m.title = 'Playbook');

insert into public.lessons (module_id, title, description, video_url, duration, position, resources)
select m.id, 'Stop Care Want More — Playbook', 'Das vollständige Content-Playbook als PDF.', null, 'PDF', 0,
  '[{"label":"Playbook (PDF)","type":"PDF","href":"storage://course-content/courses/stop-care-want-more/Stop_Care_Want_More_Playbook.pdf"}]'::jsonb
from public.modules m
join public.courses c on c.id = m.course_id and c.slug = 'stop-care-want-more' and m.title = 'Playbook'
where not exists (select 1 from public.lessons l where l.module_id = m.id and l.title = 'Stop Care Want More — Playbook');

-- ── Rechtliches für digitale Produkte ───────────────────────────────────────
insert into public.courses
  (slug, title, tagline, description, price_cents, image_url, is_active,
   level, format, audience, outcome, featured, includes, sort_order)
values (
  'rechtliches-digitale-produkte',
  'Rechtliches für digitale Produkte',
  'Rechtssicher verkaufen',
  'Die rechtlichen Grundlagen für den Verkauf digitaler Produkte: Widerruf, Disclaimer, AGB, Impressum und Datenschutz. Mit fertigen Vorlagen zum Anpassen.',
  2900,
  'https://hshkumoipyfocqnhqbql.supabase.co/storage/v1/object/public/media/courses/rechtliches-digitale-produkte/cover.png',
  true, 'Start', 'pdf',
  'Alle, die digitale Produkte rechtssicher verkaufen wollen',
  'Rechtssicheres Setup mit fertigen Vorlagen für AGB, Impressum und Datenschutz.',
  false,
  '["Grundlagen Recht & Widerruf","Disclaimer-Vorlagen","AGB-, Impressum- & Datenschutz-Vorlagen"]'::jsonb,
  41
)
on conflict (slug) do update set
  title=excluded.title, tagline=excluded.tagline, description=excluded.description,
  price_cents=excluded.price_cents, image_url=excluded.image_url, is_active=excluded.is_active,
  level=excluded.level, format=excluded.format, audience=excluded.audience,
  outcome=excluded.outcome, featured=excluded.featured, includes=excluded.includes,
  sort_order=excluded.sort_order;

insert into public.modules (course_id, title, position)
select c.id, 'Inhalte', 0 from public.courses c
where c.slug = 'rechtliches-digitale-produkte'
  and not exists (select 1 from public.modules m where m.course_id = c.id and m.title = 'Inhalte');

insert into public.lessons (module_id, title, description, video_url, duration, position, resources)
select m.id, v.title, v.descr, null, v.dur, v.pos, v.res::jsonb
from public.modules m
join public.courses c on c.id = m.course_id and c.slug = 'rechtliches-digitale-produkte' and m.title = 'Inhalte'
join (values
  (0, 'Überblick', 'PDF', 'Einführung in die rechtlichen Themen.', '[{"label":"Overview (PDF)","type":"PDF","href":"storage://course-content/courses/rechtliches-digitale-produkte/00_Overview_Rechtliches.pdf"}]'),
  (1, 'Grundlagen Recht & Widerruf', 'PDF', 'Rechtsgrundlagen und Widerruf bei digitalen Produkten.', '[{"label":"Grundlagen Recht & Widerruf (PDF)","type":"PDF","href":"storage://course-content/courses/rechtliches-digitale-produkte/01_Grundlagen_Recht_und_Widerruf.pdf"}]'),
  (2, 'Disclaimer-Vorlagen & Nutzung', 'PDF', 'Disclaimer richtig einsetzen.', '[{"label":"Disclaimer-Vorlagen (PDF)","type":"PDF","href":"storage://course-content/courses/rechtliches-digitale-produkte/02_Disclaimer_Vorlagen_Nutzung.pdf"}]'),
  (3, 'Vorlagen: AGB, Impressum, Datenschutz', 'Vorlage', 'Fertige Textvorlagen zum Anpassen.', '[{"label":"AGB-Vorlage (TXT)","type":"Template","href":"storage://course-content/courses/rechtliches-digitale-produkte/03_AGB_Vorlage.txt"},{"label":"Impressum-Vorlage (TXT)","type":"Template","href":"storage://course-content/courses/rechtliches-digitale-produkte/04_Impressum_Vorlage.txt"},{"label":"Datenschutz-Vorlage (TXT)","type":"Template","href":"storage://course-content/courses/rechtliches-digitale-produkte/05_Datenschutz_Vorlage.txt"}]')
) as v(pos, title, dur, descr, res) on true
where not exists (select 1 from public.lessons l where l.module_id = m.id and l.title = v.title);

-- ════════════════════════════════════════════════════════════════════════════
-- 2) PLACEHOLDER COURSES (empty Drive folders — inactive, correct names only)
--    Flip is_active=true + add modules/lessons once content is ready.
-- ════════════════════════════════════════════════════════════════════════════

insert into public.courses
  (slug, title, tagline, description, price_cents, is_active, level, format, featured, sort_order)
values
  ('ai-goldmining-method',       'AI Goldmining Method',              'Der Hauptkurs', 'Der komplette AI-Goldmining-Hauptkurs. Inhalte folgen.', 29700, false, 'System', 'video', false, 1),
  ('prompt-engineering-pro',     'Prompt Engineering Pro',           'AI wirklich steuern', 'Inhalte folgen.', 4900, false, 'System', 'video', false, 20),
  ('ai-digital-product-builder', 'AI Digital Product Builder',       'Produkte mit AI bauen', 'Inhalte folgen.', 4900, false, 'System', 'video', false, 30),
  ('ai-nischenfinder',           'AI Nischenfinder',                 'Deine Nische finden', 'Inhalte folgen.', 3900, false, 'Aufbau', 'video', false, 31),
  ('sales-und-vertrieb',         'Sales und Vertrieb',               'Verkaufen lernen', 'Inhalte folgen.', 4900, false, 'System', 'video', false, 42),
  ('webinar-mastery',            'Webinar Mastery',                  'Webinare, die verkaufen', 'Inhalte folgen.', 3900, false, 'Aufbau', 'video', false, 43),
  ('website-kurspage-backend',   'Website mit Kurspage im Backend',  'Deine Kursplattform', 'Inhalte folgen.', 4900, false, 'System', 'video', false, 44),
  ('bio-funnel-system',          'Bio Funnel System',                'Funnel aus deiner Bio', 'Inhalte folgen.', 4900, false, 'System', 'video', false, 50),
  ('social-media-wachstum',      'Social Media Wachstum: 0 auf 10k',  'Von 0 auf 10k', 'Inhalte folgen.', 3900, false, 'Aufbau', 'video', false, 61)
on conflict (slug) do update set
  title=excluded.title, tagline=excluded.tagline, sort_order=excluded.sort_order;
