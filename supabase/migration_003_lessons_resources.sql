-- Migration 003: Add resources JSONB and rename summary to description in lessons
-- Resources shape: [{ "label": string, "type": "PDF" | "Template" | "Prompt", "href": string }]

-- Step 1: Rename summary to description
ALTER TABLE public.lessons
  RENAME COLUMN summary TO description;

-- Step 2: Add resources JSONB column
ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS resources jsonb NOT NULL DEFAULT '[]'::jsonb;
