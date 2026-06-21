import { MessageSquare, Pin, Trash2 } from "lucide-react";
import { PageHeader, Panel, AdminBadge, StatCard } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { isAdminEmail } from "@/lib/admin";
import { CommentModerationTable } from "./moderation-table";

export const dynamic = "force-dynamic";

type CommentRow = {
  id: string;
  lesson_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  is_pinned: boolean;
  is_deleted: boolean;
  created_at: string;
};

type LessonRow = {
  id: string;
  title: string;
  module_id: string;
};

type ModuleRow = {
  id: string;
  title: string;
  course_id: string;
};

type CourseRow = {
  id: string;
  slug: string;
  title: string;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
};

export type ModerationComment = {
  id: string;
  content: string;
  authorName: string;
  authorEmail: string | null;
  isAdmin: boolean;
  lessonTitle: string;
  courseSlug: string;
  courseTitle: string;
  isPinned: boolean;
  isReply: boolean;
  createdAt: string;
};

export default async function KommentarePage() {
  const { supabase } = await requireAdmin();

  // Fetch all comments (including deleted for admin visibility)
  const { data: comments } = await supabase
    .from("lesson_comments")
    .select("*")
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  const rows = (comments ?? []) as CommentRow[];

  // Resolve lesson titles
  const lessonIds = Array.from(new Set(rows.map((r) => r.lesson_id)));
  let lessonMap = new Map<string, LessonRow>();
  let moduleMap = new Map<string, ModuleRow>();
  let courseMap = new Map<string, CourseRow>();

  if (lessonIds.length > 0) {
    const { data: lessons } = await supabase
      .from("lessons")
      .select("id, title, module_id")
      .in("id", lessonIds);

    for (const l of (lessons ?? []) as LessonRow[]) {
      lessonMap.set(l.id, l);
    }

    const moduleIds = Array.from(new Set([...lessonMap.values()].map((l) => l.module_id)));
    if (moduleIds.length > 0) {
      const { data: modules } = await supabase
        .from("modules")
        .select("id, title, course_id")
        .in("id", moduleIds);

      for (const m of (modules ?? []) as ModuleRow[]) {
        moduleMap.set(m.id, m);
      }

      const courseIds = Array.from(new Set([...moduleMap.values()].map((m) => m.course_id)));
      if (courseIds.length > 0) {
        const { data: courses } = await supabase
          .from("courses")
          .select("id, slug, title")
          .in("id", courseIds);

        for (const c of (courses ?? []) as CourseRow[]) {
          courseMap.set(c.id, c);
        }
      }
    }
  }

  // Resolve author profiles
  const userIds = Array.from(new Set(rows.map((r) => r.user_id)));
  const profileMap = new Map<string, ProfileRow>();

  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", userIds);

    for (const p of (profiles ?? []) as ProfileRow[]) {
      profileMap.set(p.id, p);
    }
  }

  // Build display rows
  const moderationRows: ModerationComment[] = rows.map((r) => {
    const profile = profileMap.get(r.user_id);
    const lesson = lessonMap.get(r.lesson_id);
    const mod = lesson ? moduleMap.get(lesson.module_id) : undefined;
    const course = mod ? courseMap.get(mod.course_id) : undefined;

    return {
      id: r.id,
      content: r.content,
      authorName: profile?.full_name?.trim() || profile?.email?.split("@")[0] || "Unbekannt",
      authorEmail: profile?.email ?? null,
      isAdmin: isAdminEmail(profile?.email),
      lessonTitle: lesson?.title ?? "Unbekannte Lektion",
      courseSlug: course?.slug ?? "",
      courseTitle: course?.title ?? "Unbekannter Kurs",
      isPinned: r.is_pinned,
      isReply: Boolean(r.parent_id),
      createdAt: r.created_at,
    };
  });

  // Course filter options
  const courseOptions = Array.from(courseMap.values()).map((c) => ({
    slug: c.slug,
    title: c.title,
  }));

  // Stats
  const totalComments = moderationRows.length;
  const pinnedCount = moderationRows.filter((r) => r.isPinned).length;
  const replyCount = moderationRows.filter((r) => r.isReply).length;

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <PageHeader
        eyebrow="Community"
        title="Kommentare"
        description="Alle Lektionskommentare verwalten, anpinnen oder löschen."
      />

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard
          label="Kommentare"
          value={totalComments}
          icon={MessageSquare}
        />
        <StatCard
          label="Angepinnt"
          value={pinnedCount}
          icon={Pin}
        />
        <StatCard
          label="Antworten"
          value={replyCount}
          icon={MessageSquare}
          hint="davon Antworten"
        />
      </div>

      <div className="mt-6">
        <Panel title="Alle Kommentare" noPadding>
          <CommentModerationTable
            comments={moderationRows}
            courseOptions={courseOptions}
          />
        </Panel>
      </div>
    </div>
  );
}
