-- Multiple course recommendations per module (was a single slug + note).
-- Stores an ordered JSON array of { slug, note } objects so the admin can point
-- members to several next-step courses after a module. The legacy single-slug
-- columns (migration_020) are kept for backward-compat / rollback and are
-- backfilled into the new column below.
alter table public.modules
  add column if not exists recommended_courses jsonb not null default '[]'::jsonb;

-- Backfill: turn any existing single recommendation into a one-element array.
update public.modules
  set recommended_courses = jsonb_build_array(
        jsonb_build_object(
          'slug', recommended_course_slug,
          'note', coalesce(recommendation_note, '')
        )
      )
  where recommended_course_slug is not null
    and recommended_course_slug <> ''
    and (recommended_courses is null or recommended_courses = '[]'::jsonb);
