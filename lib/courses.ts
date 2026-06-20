import { getSupabaseAdminClient } from "./supabase";
import {
  courses as staticCourses,
  getCourse as getStaticCourse,
  type Course,
  type ProductPage,
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
  return {
    id: m.id,
    title: m.title,
    highlights: Array.isArray(m.highlights)
      ? m.highlights.filter((h): h is string => typeof h === "string" && h.trim().length > 0)
      : [],
    lessons,
  };
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
    compareAtPriceCents:
      typeof db.compare_at_price_cents === "number" && db.compare_at_price_cents > 0
        ? db.compare_at_price_cents
        : undefined,
    image: db.image_url ?? FALLBACK_IMAGE,
    promoVideoUrl: db.promo_video_url ?? undefined,
    level: normalizeLevel(db.level),
    format: normalizeFormat(db.format),
    audience: db.audience ?? "",
    outcome: db.outcome ?? "",
    featured: db.featured ?? false,
    comingSoon: db.is_active === false,
    isUnlisted: Boolean(db.is_unlisted),
    sortOrder: db.sort_order ?? 0,
    includes: Array.isArray(db.includes) ? db.includes : [],
    bundledCourses: Array.isArray(db.bundled_courses) ? db.bundled_courses : [],
    crossSellSlugs: Array.isArray(db.cross_sell_slugs) ? db.cross_sell_slugs : [],
    affiliateText: db.affiliate_text ?? undefined,
    productPage:
      db.product_page && typeof db.product_page === "object"
        ? (db.product_page as ProductPage)
        : undefined,
    modules,
  };
}

/** Static fallback placeholders (mirrors migration_010 inactive rows). */
const COMING_SOON_CATALOG: Course[] = [];

function mergeStaticStoreCatalog(): Course[] {
  const bySlug = new Map<string, Course>();
  for (const c of staticCourses) {
    bySlug.set(c.slug, { ...c, comingSoon: false, sortOrder: c.sortOrder ?? 999 });
  }
  for (const c of COMING_SOON_CATALOG) {
    if (!bySlug.has(c.slug)) bySlug.set(c.slug, c);
  }
  return [...bySlug.values()].sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
}

const COURSE_SELECT =
  "*, modules(*, lessons(*))";

/** All active, listed courses, DB-first with static fallback. Ordered by sort_order. */
export async function getPublicCourses(): Promise<Course[]> {
  const admin = getSupabaseAdminClient();
  if (!admin) return staticCourses;

  try {
    const { data, error } = await admin
      .from("courses")
      .select(COURSE_SELECT)
      .eq("is_active", true)
      .eq("is_unlisted", false)
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

/**
 * All downloadable resource refs that belong to a course (across every lesson).
 * Used to authorize downloads: a buyer may only fetch files that are actually
 * part of the course they purchased — not arbitrary paths in the private bucket.
 */
export async function getCourseResourceRefs(slug: string): Promise<Set<string>> {
  const course = await getPublicCourse(slug);
  const refs = new Set<string>();
  if (!course) return refs;
  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      for (const resource of lesson.resources) {
        if (resource.href) refs.add(resource.href.trim());
      }
    }
  }
  return refs;
}

/** Featured courses for the homepage, DB-first with static fallback. */
export async function getFeaturedCourses(): Promise<Course[]> {
  const all = await getPublicCourses();
  const featured = all.filter((c) => c.featured);
  return featured.length > 0 ? featured : all.slice(0, 3);
}

/** Full member-store catalog: active + coming-soon placeholders, ordered by sort_order. */
export async function getStoreCatalog(): Promise<Course[]> {
  const admin = getSupabaseAdminClient();
  if (!admin) return mergeStaticStoreCatalog();

  try {
    const { data, error } = await admin
      .from("courses")
      .select(COURSE_SELECT)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) return mergeStaticStoreCatalog();
    return (data as DbCourse[]).map(mapDbCourseToCourse);
  } catch {
    return mergeStaticStoreCatalog();
  }
}
