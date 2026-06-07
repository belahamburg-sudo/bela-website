import { BookOpen, CheckCircle2, FileEdit } from "lucide-react";
import { PageHeader, StatCard } from "@/components/admin/ui";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { CoursesList, type CourseRow } from "@/components/admin/courses/courses-list";

export const dynamic = "force-dynamic";

type CourseDbRow = {
  id: string;
  slug: string;
  title: string;
  price_cents: number | null;
  level: string | null;
  format: string | null;
  featured: boolean | null;
  is_active: boolean;
  sort_order: number | null;
  modules: { id: string; lessons: { id: string }[] | null }[] | null;
};

export default async function AdminCoursesPage() {
  const admin = getSupabaseAdminClient();

  let courses: CourseDbRow[] = [];
  if (admin) {
    const { data } = await admin
      .from("courses")
      .select(
        "id, slug, title, price_cents, level, format, featured, is_active, sort_order, modules(id, lessons(id))"
      )
      .order("sort_order", { ascending: true });
    courses = (data ?? []) as CourseDbRow[];
  }

  const rows: CourseRow[] = courses.map((c) => {
    const modules = c.modules ?? [];
    const lessonCount = modules.reduce(
      (sum, m) => sum + (m.lessons?.length ?? 0),
      0
    );
    return {
      id: c.id,
      slug: c.slug,
      title: c.title,
      priceCents: c.price_cents ?? 0,
      level: c.level,
      format: c.format === "pdf" ? "pdf" : "video",
      featured: Boolean(c.featured),
      isActive: c.is_active,
      moduleCount: modules.length,
      lessonCount,
    };
  });

  const activeCount = rows.filter((r) => r.isActive).length;
  const draftCount = rows.length - activeCount;

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <PageHeader
        eyebrow="Inhalte"
        title="Kurse"
        description="Lege Kurse an, bearbeite Module und Lektionen und lade Videos & PDFs hoch."
      />

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Kurse gesamt" value={rows.length} icon={BookOpen} />
        <StatCard label="Aktiv" value={activeCount} icon={CheckCircle2} hint="im Store sichtbar" />
        <StatCard label="Entwürfe" value={draftCount} icon={FileEdit} hint="nicht veröffentlicht" />
      </div>

      <div className="mt-6">
        {admin ? (
          <CoursesList rows={rows} />
        ) : (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-6 text-sm text-amber-200/80">
            Der Service-Role-Key fehlt — ohne ihn kann der Kursbereich keine Daten
            laden oder speichern. Trage <code>SUPABASE_SERVICE_ROLE_KEY</code> in den
            Umgebungsvariablen ein.
          </div>
        )}
      </div>
    </div>
  );
}
