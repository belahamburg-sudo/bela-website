import { ScrollText } from "lucide-react";
import { PageHeader, Panel, AdminBadge } from "@/components/admin/ui";
import { DataTable, type Column } from "@/components/admin/data-table";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { getSiteSettings } from "@/lib/settings";
import { SettingsEditor } from "@/components/admin/system/settings-editor";
import {
  SettingsRawEditor,
  type RawSettingRow,
} from "@/components/admin/system/settings-raw-editor";

export const dynamic = "force-dynamic";

type SettingDbRow = {
  key: string;
  value: unknown;
  updated_at: string | null;
};

type AuditDbRow = {
  id: string;
  actor_email: string | null;
  action: string;
  entity: string | null;
  entity_id: string | null;
  created_at: string;
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function EinstellungenPage() {
  const admin = getSupabaseAdminClient();

  let settings: SettingDbRow[] = [];
  let auditRows: AuditDbRow[] = [];

  if (admin) {
    const [settingsRes, auditRes] = await Promise.all([
      admin.from("site_settings").select("*").order("key", { ascending: true }),
      admin
        .from("audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100),
    ]);
    settings = (settingsRes.data ?? []) as SettingDbRow[];
    auditRows = (auditRes.data ?? []) as AuditDbRow[];
  }

  // Resolved, typed settings (with defaults + legacy-key fallbacks) mapped back
  // into the raw jsonb shapes the editor consumes, so the form always shows the
  // values the public site actually uses.
  const site = await getSiteSettings();
  const settingsMap: Record<string, Record<string, unknown>> = {
    announcement_bar: {
      enabled: site.announcement.enabled,
      text: site.announcement.text,
      href: site.announcement.href,
    },
    promo_banner: {
      enabled: site.promoBanner.enabled,
      text: site.promoBanner.text,
      href: site.promoBanner.href,
    },
    featured_course: { slug: site.featuredCourseSlug ?? "" },
    telegram: {
      free_url: site.telegramFreeUrl ?? "",
      paid_url: site.telegramPaidUrl ?? "",
    },
    contact: { email: site.contactEmail ?? "" },
    hero: {
      headline: site.heroHeadline ?? "",
      subline: site.heroSubline ?? "",
    },
  };

  const rawRows: RawSettingRow[] = settings.map((s) => ({
    key: s.key,
    value: s.value,
    updatedAt: s.updated_at,
  }));

  const auditColumns: Column<AuditDbRow>[] = [
    {
      key: "created_at",
      header: "Zeit",
      render: (r) => <span className="text-cream/60">{formatDate(r.created_at)}</span>,
    },
    {
      key: "actor_email",
      header: "Akteur",
      render: (r) => (
        <span className="text-cream/80">{r.actor_email ?? "System"}</span>
      ),
    },
    {
      key: "action",
      header: "Aktion",
      render: (r) => (
        <AdminBadge tone="blue">
          <span className="font-mono normal-case">{r.action}</span>
        </AdminBadge>
      ),
    },
    {
      key: "entity",
      header: "Objekt",
      render: (r) => (
        <span className="font-mono text-xs text-cream/50">
          {r.entity ?? "—"}
          {r.entity_id ? ` · ${r.entity_id}` : ""}
        </span>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <PageHeader
        eyebrow="System"
        title="Einstellungen"
        description="Website-Inhalte, technische Einstellungen und das Aktivitätsprotokoll."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <SettingsEditor settings={settingsMap} />
        <SettingsRawEditor rows={rawRows} />
      </div>

      <div className="mt-6">
        <Panel
          title="Audit-Log"
          description="Die letzten 100 Aktionen in der Kontrollzentrale."
          noPadding
        >
          <DataTable
            columns={auditColumns}
            rows={auditRows}
            getRowKey={(r) => r.id}
            emptyIcon={ScrollText}
            emptyTitle="Noch keine Einträge"
            emptyDescription="Aktionen im Adminbereich werden hier protokolliert."
          />
        </Panel>
      </div>
    </div>
  );
}
