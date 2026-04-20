-- Seed: AI Goldmining courses, modules, and lessons
-- Idempotent: ON CONFLICT DO NOTHING on all inserts
-- Resources seeded as empty array — add real resources via Supabase Studio

-- ============================================================
-- Course 1: AI Goldmining Starter
-- ============================================================
INSERT INTO public.courses (id, slug, title, tagline, description, price_cents, image_url, is_active)
VALUES (
  '11111111-0000-0000-0000-000000000001',
  'ai-goldmining-starter',
  'AI Goldmining Starter',
  'Dein erstes digitales Produkt mit AI',
  'Von der vagen Idee zum klaren Angebot. Kein Theorie-Marathon — du gehst mit einem verkaufsfertigen Produkt raus.',
  2900,
  '/assets/generated/course-starter.svg',
  true
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.modules (id, course_id, title, position)
VALUES (
  '11111111-1000-0000-0000-000000000001',
  '11111111-0000-0000-0000-000000000001',
  'Von Idee zu Goldmine',
  0
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.lessons (id, module_id, title, description, video_url, duration, position, resources)
VALUES (
  '11111111-1000-0001-0000-000000000001',
  '11111111-1000-0000-0000-000000000001',
  'Warum digitale Produkte der schlankste Einstieg sind',
  'Der Vergleich zu Dropshipping, Agenturen und SaaS — und warum digitale Produkte die höchste Marge pro eingesetzter Stunde haben.',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  '12 Min.',
  0,
  '[]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.lessons (id, module_id, title, description, video_url, duration, position, resources)
VALUES (
  '11111111-1000-0002-0000-000000000001',
  '11111111-1000-0000-0000-000000000001',
  'Deine erste Produktidee finden',
  'Skills × Interessen × Zielgruppenproblem. Das Mapping-Framework, mit dem du aus drei Rohinputs eine kaufbare Idee ableitest.',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  '18 Min.',
  1,
  '[]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.modules (id, course_id, title, position)
VALUES (
  '11111111-2000-0000-0000-000000000001',
  '11111111-0000-0000-0000-000000000001',
  'Packaging mit AI',
  1
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.lessons (id, module_id, title, description, video_url, duration, position, resources)
VALUES (
  '11111111-2000-0001-0000-000000000001',
  '11111111-2000-0000-0000-000000000001',
  'Name, Promise und Inhaltsstruktur',
  'Aus rohen Gedanken wird ein Angebot: Titel, Ergebnis, Module, Kaufmotivation. Alles in einem Prompt-Loop.',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  '21 Min.',
  0,
  '[]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Course 2: Template Goldmine
-- ============================================================
INSERT INTO public.courses (id, slug, title, tagline, description, price_cents, image_url, is_active)
VALUES (
  '22222222-0000-0000-0000-000000000002',
  'template-goldmine',
  'Template Goldmine',
  'Vorlagen bauen und verkaufen',
  'Notion, Canva, Sheets, Framer. Templates, die einen echten Workflow lösen — keine schicken Dateien ohne Zweck.',
  3900,
  '/assets/generated/course-template.svg',
  true
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.modules (id, course_id, title, position)
VALUES (
  '22222222-1000-0000-0000-000000000002',
  '22222222-0000-0000-0000-000000000002',
  'Template-Produkt bauen',
  0
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.lessons (id, module_id, title, description, video_url, duration, position, resources)
VALUES (
  '22222222-1000-0001-0000-000000000002',
  '22222222-1000-0000-0000-000000000002',
  'Was ein Template kaufbar macht',
  'Unterschied zwischen hübscher Datei und echtem Prozessgewinn. Käufer bezahlen für gesparte Stunden, nicht für Ästhetik allein.',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  '15 Min.',
  0,
  '[]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.lessons (id, module_id, title, description, video_url, duration, position, resources)
VALUES (
  '22222222-1000-0002-0000-000000000002',
  '22222222-1000-0000-0000-000000000002',
  'Aus einem Workflow ein Produkt machen',
  'Wiederholbare Abläufe zerlegen und in eine Template-Struktur gießen, die auch ohne dich funktioniert.',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  '24 Min.',
  1,
  '[]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Course 3: Mini-Kurs Maschine
-- ============================================================
INSERT INTO public.courses (id, slug, title, tagline, description, price_cents, image_url, is_active)
VALUES (
  '33333333-0000-0000-0000-000000000003',
  'mini-kurs-maschine',
  'Mini-Kurs Maschine',
  'Kursidee bis Verkaufsseite',
  'Ein schlanker Kurs mit einem klaren Ergebnis — nicht 100 Lektionen Content-Friedhof.',
  4900,
  '/assets/generated/course-minikurs.svg',
  true
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.modules (id, course_id, title, position)
VALUES (
  '33333333-1000-0000-0000-000000000003',
  '33333333-0000-0000-0000-000000000003',
  'Der schlanke Kurs',
  0
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.lessons (id, module_id, title, description, video_url, duration, position, resources)
VALUES (
  '33333333-1000-0001-0000-000000000003',
  '33333333-1000-0000-0000-000000000003',
  'Ein Ergebnis, nicht 100 Lektionen',
  'Fokus schlägt Umfang. Wie du das eine Ergebnis definierst und alles entfernst, was den Kauf blockiert.',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  '17 Min.',
  0,
  '[]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.lessons (id, module_id, title, description, video_url, duration, position, resources)
VALUES (
  '33333333-1000-0002-0000-000000000003',
  '33333333-1000-0000-0000-000000000003',
  'Module und Skripte mit AI bauen',
  'AI als Strukturhilfe — nicht als Content-Generator. Der Prompt-Workflow vom Outline bis zur fertigen Lektion.',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  '27 Min.',
  1,
  '[]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Course 4: Funnel & Store System
-- ============================================================
INSERT INTO public.courses (id, slug, title, tagline, description, price_cents, image_url, is_active)
VALUES (
  '44444444-0000-0000-0000-000000000004',
  'funnel-store-system',
  'Funnel & Store System',
  'Automatisiert verkaufen',
  'Store, Lead-Magnet, Webinar und Community als ein kohärentes System, das ohne dich arbeitet.',
  5900,
  '/assets/generated/course-funnel.svg',
  true
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.modules (id, course_id, title, position)
VALUES (
  '44444444-1000-0000-0000-000000000004',
  '44444444-0000-0000-0000-000000000004',
  'Vom Klick zum Kauf',
  0
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.lessons (id, module_id, title, description, video_url, duration, position, resources)
VALUES (
  '44444444-1000-0001-0000-000000000004',
  '44444444-1000-0000-0000-000000000004',
  'Die 5 Seiten im System',
  'Landingpage, Webinar, Store, Kursdetailseite, Dashboard — jede mit einem einzigen klaren Job.',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  '20 Min.',
  0,
  '[]'::jsonb
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.lessons (id, module_id, title, description, video_url, duration, position, resources)
VALUES (
  '44444444-1000-0002-0000-000000000004',
  '44444444-1000-0000-0000-000000000004',
  'Newsletter und Community als Verkaufsmotor',
  'Vertrauen vor Verkauf. Der Follow-up-Prozess ohne aggressive Push-Mechanik.',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  '22 Min.',
  1,
  '[]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Course 5: AI Goldmining Starter Pack (Bundle)
-- ============================================================
INSERT INTO public.courses (id, slug, title, tagline, description, price_cents, image_url, is_active)
VALUES (
  '55555555-0000-0000-0000-000000000005',
  'ai-goldmining-starter-pack',
  'AI Goldmining Starter Pack',
  'Alle Startkurse im Bundle',
  'Der kompakte Komplettstart: Produktidee, Template, Mini-Kurs und Funnel-System als eine zusammenhängende Roadmap.',
  9700,
  '/assets/generated/course-bundle.svg',
  true
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.modules (id, course_id, title, position)
VALUES (
  '55555555-1000-0000-0000-000000000005',
  '55555555-0000-0000-0000-000000000005',
  'Starter Pack Roadmap',
  0
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.lessons (id, module_id, title, description, video_url, duration, position, resources)
VALUES (
  '55555555-1000-0001-0000-000000000005',
  '55555555-1000-0000-0000-000000000005',
  'Deine 90-Tage AI-Goldmining-Roadmap',
  'Kurs-Reihenfolge, Meilensteine, was in den ersten 30, 60 und 90 Tagen gebaut wird.',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  '31 Min.',
  0,
  '[]'::jsonb
) ON CONFLICT (id) DO NOTHING;
