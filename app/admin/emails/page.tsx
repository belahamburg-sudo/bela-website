import { Megaphone, Send, Users, Inbox } from "lucide-react";
import { PageHeader, StatCard, Panel } from "@/components/admin/ui";
import { DataTable, type Column } from "@/components/admin/data-table";
import { AdminBadge } from "@/components/admin/ui";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { BroadcastComposer } from "@/components/admin/comms/broadcast-composer";
import { SEGMENT_LABELS, type Segment } from "./segments";

export const dynamic = "force-dynamic";

type BroadcastRow = {
  id: string;
  subject: string | null;
  template: string;
  segment: string | null;
  recipient_count: number;
  status: string;
  created_at: string;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function segmentLabel(segment: string | null): string {
  if (!segment) return "—";
  return SEGMENT_LABELS[segment as Segment] ?? segment;
}

function statusTone(status: string): "green" | "amber" | "red" | "neutral" {
  if (status === "sent") return "green";
  if (status === "pending" || status === "sending") return "amber";
  if (status === "failed") return "red";
  return "neutral";
}

export default async function EmailsPage() {
  const admin = getSupabaseAdminClient();

  let broadcasts: BroadcastRow[] = [];
  if (admin) {
    const { data } = await admin
      .from("email_broadcasts")
      .select("id, subject, template, segment, recipient_count, status, created_at")
      .order("created_at", { ascending: false });
    broadcasts = (data ?? []) as BroadcastRow[];
  }

  const totalBroadcasts = broadcasts.length;
  const reached = broadcasts.reduce((sum, b) => sum + (b.recipient_count ?? 0), 0);

  const columns: Column<BroadcastRow>[] = [
    {
      key: "subject",
      header: "Betreff",
      render: (r) => (
        <span className="font-medium text-cream/90">
          {r.subject?.trim() || <span className="text-cream/40">(Standard-Betreff)</span>}
        </span>
      ),
    },
    {
      key: "template",
      header: "Template",
      render: (r) => <span className="font-mono text-xs text-cream/60">{r.template}</span>,
    },
    {
      key: "segment",
      header: "Segment",
      render: (r) => <AdminBadge tone="blue">{segmentLabel(r.segment)}</AdminBadge>,
    },
    {
      key: "recipient_count",
      header: "Empfänger",
      align: "right",
      render: (r) => (
        <span className="font-bold text-cream/90">{r.recipient_count ?? 0}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => <AdminBadge tone={statusTone(r.status)}>{r.status}</AdminBadge>,
    },
    {
      key: "created_at",
      header: "Datum",
      align: "right",
      render: (r) => <span className="text-cream/60">{formatDate(r.created_at)}</span>,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <PageHeader
        eyebrow="Kommunikation"
        title="E-Mail-Broadcasts"
        description="Versende Kampagnen an deine Mitglieder, Leads und Käufer – und behalte den Verlauf im Blick."
      />

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard
          label="Broadcasts gesamt"
          value={totalBroadcasts}
          icon={Megaphone}
          hint="versendete Kampagnen"
        />
        <StatCard
          label="Empfänger erreicht"
          value={reached}
          icon={Users}
          hint="kumuliert über alle Broadcasts"
        />
        <StatCard
          label="Letzter Versand"
          value={broadcasts[0] ? formatDate(broadcasts[0].created_at).split(",")[0] : "—"}
          icon={Send}
        />
      </div>

      <div className="mt-6">
        <BroadcastComposer />
      </div>

      <div className="mt-6">
        <Panel title="Versand-Verlauf" noPadding>
          <DataTable
            columns={columns}
            rows={broadcasts}
            getRowKey={(r) => r.id}
            emptyIcon={Inbox}
            emptyTitle="Noch keine Broadcasts"
            emptyDescription="Sobald du einen Broadcast versendest, erscheint er hier."
          />
        </Panel>
      </div>
    </div>
  );
}
