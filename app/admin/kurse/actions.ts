"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, logAudit } from "@/lib/admin";
import { publicUrl, parseStorageRef } from "@/lib/storage";
import { courses as staticCourses } from "@/lib/content";
import { serializeIncludes, IMPORT_SOURCE_LABEL } from "@/lib/course-includes";

type ActionResult = { ok: boolean; error?: string };
type CreateResult = ActionResult & { id?: string };

/** Per-course outcome of an import run, for a human-readable summary. */
export type ImportedCourse = {
  title: string;
  slug: string;
  lessonCount: number;
  moduleCount: number;
};
export type SkippedCourse = { title: string; slug: string };

export type SeedResult = ActionResult & {
  /** Absolute label of where the catalog was read from. */
  source?: string;
  created?: number;
  skipped?: number;
  lessonsImported?: number;
  modulesImported?: number;
  importedCourses?: ImportedCourse[];
  skippedCourses?: SkippedCourse[];
};

type ResourceItem = { label: string; type: "PDF" | "Template" | "Prompt"; href: string };

function clean(value?: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function duplicateMessage(message: string): string {
  return /duplicate|unique/i.test(message) ? "Dieser Slug ist bereits vergeben." : message;
}

/** Convert a storage://media/… ref into a stable public URL; pass everything else through. */
function resolvePublicImage(value?: string | null): string | null {
  const v = clean(value);
  if (!v) return null;
  const ref = parseStorageRef(v);
  if (!ref) return v; // external URL or local /assets path
  return publicUrl(ref.bucket, ref.path) ?? v;
}

/**
 * Parse one "Enthalten" line into a structured point.
 *
 * Supported syntaxes (all optional — plain text keeps working):
 *   "Label | https://example.com"        → external link
 *   "Label -> /kurse/other-slug"         → internal/course cross-reference
 *   "Label"                              → plain text point
 *
 * Returns a clean, canonical string that round-trips:
 *   with link  → "Label | href"
 *   plain      → "Label"
 */
function normalizeResources(resources?: ResourceItem[]): ResourceItem[] {
  if (!Array.isArray(resources)) return [];
  return resources
    .map<ResourceItem>((r) => ({
      label: clean(r.label) ?? "",
      type: r.type === "Template" || r.type === "Prompt" ? r.type : "PDF",
      href: clean(r.href) ?? "",
    }))
    .filter((r) => r.label && r.href);
}

// ─────────────────────────────────────── Courses ───────────────────────────────────────

export async function createCourse(input: {
  title: string;
  slug?: string | null;
}): Promise<CreateResult> {
  const title = clean(input.title);
  if (!title) return { ok: false, error: "Titel ist erforderlich." };
  const slug = slugify(input.slug || title);
  if (!slug) return { ok: false, error: "Konnte keinen gültigen Slug bilden." };

  const { user, supabase } = await requireAdmin();

  const { data: maxRow } = await supabase
    .from("courses")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sortOrder = (maxRow?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("courses")
    .insert({ title, slug, sort_order: sortOrder, is_active: false })
    .select("id")
    .single();

  if (error) return { ok: false, error: duplicateMessage(error.message) };

  await logAudit({
    actorEmail: user.email,
    action: "course.create",
    entity: "courses",
    entityId: data?.id ?? null,
    meta: { slug, title },
  });

  revalidatePath("/admin/kurse");
  return { ok: true, id: data?.id };
}

export type CourseInput = {
  id: string;
  title: string;
  slug?: string | null;
  tagline?: string | null;
  description?: string | null;
  priceCents?: number;
  imageUrl?: string | null;
  level?: string | null;
  format?: string | null;
  audience?: string | null;
  outcome?: string | null;
  featured?: boolean;
  isActive?: boolean;
  sortOrder?: number;
  includes?: string[];
};

export async function updateCourse(input: CourseInput): Promise<ActionResult> {
  if (!input.id) return { ok: false, error: "Keine Kurs-ID angegeben." };
  const title = clean(input.title);
  if (!title) return { ok: false, error: "Titel ist erforderlich." };
  const slug = slugify(input.slug || title);
  if (!slug) return { ok: false, error: "Konnte keinen gültigen Slug bilden." };

  const { user, supabase } = await requireAdmin();

  const { error } = await supabase
    .from("courses")
    .update({
      title,
      slug,
      tagline: clean(input.tagline),
      description: clean(input.description),
      price_cents:
        typeof input.priceCents === "number" && Number.isFinite(input.priceCents)
          ? Math.max(0, Math.round(input.priceCents))
          : 0,
      image_url: resolvePublicImage(input.imageUrl),
      level: clean(input.level),
      format: input.format === "pdf" ? "pdf" : "video",
      audience: clean(input.audience),
      outcome: clean(input.outcome),
      featured: Boolean(input.featured),
      is_active: Boolean(input.isActive),
      sort_order:
        typeof input.sortOrder === "number" && Number.isFinite(input.sortOrder)
          ? Math.round(input.sortOrder)
          : 0,
      includes: Array.isArray(input.includes)
        ? serializeIncludes(input.includes)
        : [],
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.id);

  if (error) return { ok: false, error: duplicateMessage(error.message) };

  await logAudit({
    actorEmail: user.email,
    action: "course.update",
    entity: "courses",
    entityId: input.id,
    meta: { slug },
  });

  revalidatePath("/admin/kurse");
  revalidatePath(`/admin/kurse/${input.id}`);
  revalidatePath("/kurse");
  revalidatePath(`/kurse/${slug}`);
  revalidatePath("/db/kurse");
  return { ok: true };
}

export async function toggleCourseActive(input: {
  id: string;
  isActive: boolean;
}): Promise<ActionResult> {
  if (!input.id) return { ok: false, error: "Keine Kurs-ID angegeben." };
  const { user, supabase } = await requireAdmin();

  const { error } = await supabase
    .from("courses")
    .update({ is_active: input.isActive, updated_at: new Date().toISOString() })
    .eq("id", input.id);

  if (error) return { ok: false, error: error.message };

  await logAudit({
    actorEmail: user.email,
    action: "course.toggle_active",
    entity: "courses",
    entityId: input.id,
    meta: { is_active: input.isActive },
  });

  revalidatePath("/admin/kurse");
  revalidatePath("/kurse");
  revalidatePath("/db/kurse");
  return { ok: true };
}

export async function deleteCourse(id: string): Promise<ActionResult> {
  if (!id) return { ok: false, error: "Keine Kurs-ID angegeben." };
  const { user, supabase } = await requireAdmin();

  // modules + lessons cascade via FK on delete.
  const { error } = await supabase.from("courses").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  await logAudit({
    actorEmail: user.email,
    action: "course.delete",
    entity: "courses",
    entityId: id,
  });

  revalidatePath("/admin/kurse");
  revalidatePath("/kurse");
  revalidatePath("/db/kurse");
  return { ok: true };
}

// ─────────────────────────────────────── Modules ───────────────────────────────────────

export async function createModule(input: {
  courseId: string;
  title: string;
}): Promise<CreateResult> {
  const title = clean(input.title);
  if (!input.courseId) return { ok: false, error: "Keine Kurs-ID angegeben." };
  if (!title) return { ok: false, error: "Modultitel ist erforderlich." };

  const { user, supabase } = await requireAdmin();

  const { data: maxRow } = await supabase
    .from("modules")
    .select("position")
    .eq("course_id", input.courseId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const position = (maxRow?.position ?? -1) + 1;

  const { data, error } = await supabase
    .from("modules")
    .insert({ course_id: input.courseId, title, position })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  await logAudit({
    actorEmail: user.email,
    action: "module.create",
    entity: "modules",
    entityId: data?.id ?? null,
    meta: { courseId: input.courseId, title },
  });

  revalidatePath(`/admin/kurse/${input.courseId}`);
  return { ok: true, id: data?.id };
}

export async function updateModule(input: {
  id: string;
  courseId: string;
  title: string;
}): Promise<ActionResult> {
  const title = clean(input.title);
  if (!input.id) return { ok: false, error: "Keine Modul-ID angegeben." };
  if (!title) return { ok: false, error: "Modultitel ist erforderlich." };

  const { user, supabase } = await requireAdmin();
  const { error } = await supabase.from("modules").update({ title }).eq("id", input.id);
  if (error) return { ok: false, error: error.message };

  await logAudit({
    actorEmail: user.email,
    action: "module.update",
    entity: "modules",
    entityId: input.id,
    meta: { title },
  });

  revalidatePath(`/admin/kurse/${input.courseId}`);
  return { ok: true };
}

export async function deleteModule(input: {
  id: string;
  courseId: string;
}): Promise<ActionResult> {
  if (!input.id) return { ok: false, error: "Keine Modul-ID angegeben." };
  const { user, supabase } = await requireAdmin();

  const { error } = await supabase.from("modules").delete().eq("id", input.id);
  if (error) return { ok: false, error: error.message };

  await logAudit({
    actorEmail: user.email,
    action: "module.delete",
    entity: "modules",
    entityId: input.id,
  });

  revalidatePath(`/admin/kurse/${input.courseId}`);
  return { ok: true };
}

export async function reorderModules(input: {
  courseId: string;
  orderedIds: string[];
}): Promise<ActionResult> {
  if (!input.courseId) return { ok: false, error: "Keine Kurs-ID angegeben." };
  const { supabase } = await requireAdmin();

  const results = await Promise.all(
    input.orderedIds.map((id, index) =>
      supabase
        .from("modules")
        .update({ position: index })
        .eq("id", id)
        .eq("course_id", input.courseId)
    )
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) return { ok: false, error: failed.error.message };

  revalidatePath(`/admin/kurse/${input.courseId}`);
  return { ok: true };
}

// ─────────────────────────────────────── Lessons ───────────────────────────────────────

export type LessonInput = {
  moduleId: string;
  courseId: string;
  title: string;
  description?: string | null;
  videoUrl?: string | null;
  duration?: string | null;
  resources?: ResourceItem[];
};

export async function createLesson(input: LessonInput): Promise<CreateResult> {
  const title = clean(input.title);
  if (!input.moduleId) return { ok: false, error: "Kein Modul angegeben." };
  if (!title) return { ok: false, error: "Lektionstitel ist erforderlich." };

  const { user, supabase } = await requireAdmin();

  const { data: maxRow } = await supabase
    .from("lessons")
    .select("position")
    .eq("module_id", input.moduleId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const position = (maxRow?.position ?? -1) + 1;

  const { data, error } = await supabase
    .from("lessons")
    .insert({
      module_id: input.moduleId,
      title,
      description: clean(input.description),
      video_url: clean(input.videoUrl),
      duration: clean(input.duration),
      position,
      resources: normalizeResources(input.resources),
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  await logAudit({
    actorEmail: user.email,
    action: "lesson.create",
    entity: "lessons",
    entityId: data?.id ?? null,
    meta: { moduleId: input.moduleId, title },
  });

  revalidatePath(`/admin/kurse/${input.courseId}`);
  return { ok: true, id: data?.id };
}

export async function updateLesson(
  input: Omit<LessonInput, "moduleId"> & { id: string }
): Promise<ActionResult> {
  const title = clean(input.title);
  if (!input.id) return { ok: false, error: "Keine Lektions-ID angegeben." };
  if (!title) return { ok: false, error: "Lektionstitel ist erforderlich." };

  const { user, supabase } = await requireAdmin();

  const { error } = await supabase
    .from("lessons")
    .update({
      title,
      description: clean(input.description),
      video_url: clean(input.videoUrl),
      duration: clean(input.duration),
      resources: normalizeResources(input.resources),
    })
    .eq("id", input.id);

  if (error) return { ok: false, error: error.message };

  await logAudit({
    actorEmail: user.email,
    action: "lesson.update",
    entity: "lessons",
    entityId: input.id,
    meta: { title },
  });

  revalidatePath(`/admin/kurse/${input.courseId}`);
  return { ok: true };
}

export async function deleteLesson(input: {
  id: string;
  courseId: string;
}): Promise<ActionResult> {
  if (!input.id) return { ok: false, error: "Keine Lektions-ID angegeben." };
  const { user, supabase } = await requireAdmin();

  const { error } = await supabase.from("lessons").delete().eq("id", input.id);
  if (error) return { ok: false, error: error.message };

  await logAudit({
    actorEmail: user.email,
    action: "lesson.delete",
    entity: "lessons",
    entityId: input.id,
  });

  revalidatePath(`/admin/kurse/${input.courseId}`);
  return { ok: true };
}

export async function reorderLessons(input: {
  moduleId: string;
  courseId: string;
  orderedIds: string[];
}): Promise<ActionResult> {
  if (!input.moduleId) return { ok: false, error: "Kein Modul angegeben." };
  const { supabase } = await requireAdmin();

  const results = await Promise.all(
    input.orderedIds.map((id, index) =>
      supabase
        .from("lessons")
        .update({ position: index })
        .eq("id", id)
        .eq("module_id", input.moduleId)
    )
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) return { ok: false, error: failed.error.message };

  revalidatePath(`/admin/kurse/${input.courseId}`);
  return { ok: true };
}

// ──────────────────────────────────── Seed import ────────────────────────────────────

/** Import the bundled static catalog (lib/content.ts) into the DB. Idempotent by slug. */
export async function seedStarterCatalog(): Promise<SeedResult> {
  const { user, supabase } = await requireAdmin();

  const { data: existing } = await supabase.from("courses").select("slug");
  const existingSlugs = new Set((existing ?? []).map((c) => c.slug));

  const importedCourses: ImportedCourse[] = [];
  const skippedCourses: SkippedCourse[] = [];
  let lessonsImported = 0;
  let modulesImported = 0;

  for (let i = 0; i < staticCourses.length; i++) {
    const c = staticCourses[i];
    if (existingSlugs.has(c.slug)) {
      skippedCourses.push({ title: c.title, slug: c.slug });
      continue;
    }

    const { data: courseRow, error: courseErr } = await supabase
      .from("courses")
      .insert({
        slug: c.slug,
        title: c.title,
        tagline: c.tagline,
        description: c.description,
        price_cents: c.priceCents,
        image_url: c.image,
        is_active: true,
        level: c.level,
        format: c.format,
        audience: c.audience,
        outcome: c.outcome,
        featured: c.featured ?? false,
        includes: c.includes,
        sort_order: i,
      })
      .select("id")
      .single();

    if (courseErr || !courseRow) continue;

    let courseLessons = 0;
    let courseModules = 0;
    for (let mi = 0; mi < c.modules.length; mi++) {
      const m = c.modules[mi];
      const { data: modRow } = await supabase
        .from("modules")
        .insert({ course_id: courseRow.id, title: m.title, position: mi })
        .select("id")
        .single();
      if (!modRow) continue;
      courseModules++;

      if (m.lessons.length > 0) {
        await supabase.from("lessons").insert(
          m.lessons.map((l, li) => ({
            module_id: modRow.id,
            title: l.title,
            description: l.summary,
            video_url: l.videoUrl,
            duration: l.duration,
            position: li,
            resources: l.resources,
          }))
        );
        courseLessons += m.lessons.length;
      }
    }

    lessonsImported += courseLessons;
    modulesImported += courseModules;
    importedCourses.push({
      title: c.title,
      slug: c.slug,
      lessonCount: courseLessons,
      moduleCount: courseModules,
    });
  }

  const created = importedCourses.length;
  const skipped = skippedCourses.length;

  await logAudit({
    actorEmail: user.email,
    action: "course.seed_catalog",
    entity: "courses",
    meta: { source: IMPORT_SOURCE_LABEL, created, skipped, lessonsImported, modulesImported },
  });

  revalidatePath("/admin/kurse");
  revalidatePath("/kurse");
  revalidatePath("/db/kurse");
  return {
    ok: true,
    source: IMPORT_SOURCE_LABEL,
    created,
    skipped,
    lessonsImported,
    modulesImported,
    importedCourses,
    skippedCourses,
  };
}
