import { getSupabaseAdminClient } from "./supabase";
import {
  courses as staticCourses,
  getCourse as getStaticCourse,
  type Course,
} from "./content";
import type { DbCourse, DbLesson, DbModule } from "./db-types";

/**
 * DB-first course data layer with a static fallback.
 *
 * The public marketing site and member area read courses through here. When the
 * Supabase tables are populated, the DB wins; if the service-role client is
 * missing or a query fails/returns nothing, we fall back to the bundled static
 * catalog in content.ts so the live site never breaks before the migration is
 * applied or the catalog is seeded.
 */

const FALLBACK_IMAGE = "/assets/generated/course-starter.svg";
const VALID_LEVELS: Course["level"][] = ["Start", "Aufbau", "System", "Bundle"];

function normalizeLevel(value: string | null | undefined): Course["level"] {
  return VALID_LEVELS.includes(value as Course["level"])
    ? (value as Course["level"])
    : "Start";
}

function normalizeFormat(value: string | null | undefined): Course["format"] {
  return value === "pdf" ? "pdf" : "video";
}

function mapLesson(l: DbLesson): Course["modules"][number]["lessons"][number] {
  return {
    id: l.id,
    title: l.title,
    duration: l.duration ?? "",
    summary: l.description ?? "",
    videoUrl: l.video_url ?? "",
    resources: Array.isArray(l.resources) ? l.resources : [],
  };
}

function mapModule(m: DbModule): Course["modules"][number] {
  const lessons = [...(m.lessons ?? [])]
    .sort((a, b) => a.position - b.position)
    .map(mapLesson);
  return { id: m.id, title: m.title, lessons };
}

/** Map a Supabase course row (with nested modules/lessons) to the Course shape. */
export function mapDbCourseToCourse(db: DbCourse): Course {
  const modules = [...(db.modules ?? [])]
    .sort((a, b) => a.position - b.position)
    .map(mapModule);

  return {
    slug: db.slug,
    title: db.title,
    tagline: db.tagline ?? "",
    description: db.description ?? "",
    priceCents: db.price_cents,
    image: db.image_url ?? FALLBACK_IMAGE,
    level: normalizeLevel(db.level),
    format: normalizeFormat(db.format),
    audience: db.audience ?? "",
    outcome: db.outcome ?? "",
    featured: db.featured ?? false,
    includes: Array.isArray(db.includes) ? db.includes : [],
    modules,
  };
}

const COURSE_SELECT =
  "*, modules(*, lessons(*))";

/** All active courses, DB-first with static fallback. Ordered by sort_order. */
export async function getPublicCourses(): Promise<Course[]> {
  const admin = getSupabaseAdminClient();
  if (!admin) return staticCourses;

  try {
    const { data, error } = await admin
      .from("courses")
      .select(COURSE_SELECT)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) return staticCourses;
    return (data as DbCourse[]).map(mapDbCourseToCourse);
  } catch {
    return staticCourses;
  }
}

/** A single course by slug, DB-first with static fallback. */
export async function getPublicCourse(slug: string): Promise<Course | undefined> {
  const admin = getSupabaseAdminClient();
  if (!admin) return getStaticCourse(slug);

  try {
    const { data, error } = await admin
      .from("courses")
      .select(COURSE_SELECT)
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) return getStaticCourse(slug);
    return mapDbCourseToCourse(data as DbCourse);
  } catch {
    return getStaticCourse(slug);
  }
}

/** Featured courses for the homepage, DB-first with static fallback. */
export async function getFeaturedCourses(): Promise<Course[]> {
  const all = await getPublicCourses();
  const featured = all.filter((c) => c.featured);
  return featured.length > 0 ? featured : all.slice(0, 3);
}
