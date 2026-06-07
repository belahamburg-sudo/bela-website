"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, Search, UserPlus, Plus, Trash2 } from "lucide-react";
import { Panel, AdminBadge } from "@/components/admin/ui";
import { DataTable, type Column } from "@/components/admin/data-table";
import { AdminButton } from "@/components/admin/admin-button";
import { Modal } from "@/components/admin/modal";
import { useToast } from "@/components/admin/toast";
import {
  updateLeadStatus,
  createLead,
  deleteLead,
} from "@/app/admin/leads/actions";

export type LeadRow = {
  id: string;
  email: string;
  name: string | null;
  source: string;
  status: string;
  createdAt: string;
};

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "new", label: "Neu" },
  { value: "contacted", label: "Kontaktiert" },
  { value: "converted", label: "Konvertiert" },
  { value: "archived", label: "Archiviert" },
];

const SOURCE_OPTIONS: { value: string; label: string }[] = [
  { value: "newsletter", label: "Newsletter" },
  { value: "webinar", label: "Webinar" },
  { value: "community", label: "Community" },
];

function statusLabel(status: string): string {
  return STATUS_OPTIONS.find((s) => s.value === status)?.label ?? status;
}

function sourceLabel(source: string): string {
  return SOURCE_OPTIONS.find((s) => s.value === source)?.label ?? source;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function downloadCsv(rows: LeadRow[]) {
  const header = ["E-Mail", "Name", "Quelle", "Status", "Datum"];
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const lines = rows.map((r) =>
    [r.email, r.name ?? "", sourceLabel(r.source), statusLabel(r.status), r.createdAt]
      .map((cell) => escape(String(cell)))
      .join(",")
  );
  const csv = [header.map(escape).join(","), ...lines].join("\n");
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function StatusSelect({
  row,
  disabled,
  onChange,
}: {
  row: LeadRow;
  disabled: boolean;
  onChange: (id: string, status: string) => void;
}) {
  return (
    <select
      value={row.status}
      disabled={disabled}
      onChange={(e) => onChange(row.id, e.target.value)}
      className="rounded-lg border border-white/10 bg-obsidian/60 px-2.5 py-1.5 text-xs font-medium text-cream/80 transition-colors focus:border-gold-300/40 focus:outline-none disabled:opacity-50"
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-ink text-cream">
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export function LeadsManager({ rows }: { rows: LeadRow[] }) {
  const router = useRouter();
  const { success, error } = useToast();
  const [pending, startTransition] = useTransition();

  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [toDelete, setToDelete] = useState<LeadRow | null>(null);

  // add-form state
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [source, setSource] = useState("newsletter");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.email.toLowerCase().includes(q) ||
        (r.name ?? "").toLowerCase().includes(q)
    );
  }, [rows, query]);

  function handleStatusChange(id: string, status: string) {
    startTransition(async () => {
      const res = await updateLeadStatus({ id, status });
      if (res.ok) {
        success("Status aktualisiert.");
        router.refresh();
      } else {
        error(res.error ?? "Aktualisierung fehlgeschlagen.");
      }
    });
  }

  function handleCreate() {
    startTransition(async () => {
      const res = await createLead({ email, name, source });
      if (res.ok) {
        success("Lead hinzugefügt.");
        setAddOpen(false);
        setEmail("");
        setName("");
        setSource("newsletter");
        router.refresh();
      } else {
        error(res.error ?? "Hinzufügen fehlgeschlagen.");
      }
    });
  }

  function handleDelete() {
    if (!toDelete) return;
    const id = toDelete.id;
    startTransition(async () => {
      const res = await deleteLead(id);
      if (res.ok) {
        success("Lead gelöscht.");
        setToDelete(null);
        router.refresh();
      } else {
        error(res.error ?? "Löschen fehlgeschlagen.");
      }
    });
  }

  const columns: Column<LeadRow>[] = [
    {
      key: "email",
      header: "E-Mail",
      render: (r) => <span className="font-medium text-cream/90">{r.email}</span>,
    },
    {
      key: "name",
      header: "Name",
      render: (r) => <span className="text-cream/70">{r.name ?? "—"}</span>,
    },
    {
      key: "source",
      header: "Quelle",
      render: (r) => <AdminBadge tone="blue">{sourceLabel(r.source)}</AdminBadge>,
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <StatusSelect row={r} disabled={pending} onChange={handleStatusChange} />
      ),
    },
    {
      key: "createdAt",
      header: "Datum",
      align: "right",
      render: (r) => <span className="text-cream/50">{formatDate(r.createdAt)}</span>,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (r) => (
        <button
          onClick={() => setToDelete(r)}
          className="inline-flex items-center justify-center rounded-lg border border-white/10 p-1.5 text-cream/40 transition-colors hover:border-red-500/40 hover:text-red-300"
          aria-label="Lead löschen"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      ),
    },
  ];

  return (
    <>
      <Panel
        title="Alle Leads"
        description={`${filtered.length} von ${rows.length} Leads`}
        noPadding
        actions={
          <div className="flex items-center gap-2">
            <AdminButton
              variant="secondary"
              size="sm"
              icon={Download}
              onClick={() => downloadCsv(filtered)}
              disabled={filtered.length === 0}
            >
              CSV exportieren
            </AdminButton>
            <AdminButton
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setAddOpen(true)}
            >
              Lead hinzufügen
            </AdminButton>
          </div>
        }
      >
        <div className="border-b border-white/5 px-5 py-4">
          <div className="relative sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-cream/30" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="E-Mail oder Name suchen…"
              className="w-full rounded-lg border border-white/10 bg-obsidian/60 py-2 pl-9 pr-3 text-sm text-cream placeholder:text-cream/30 focus:border-gold-300/40 focus:outline-none"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          rows={filtered}
          getRowKey={(r) => r.id}
          emptyIcon={UserPlus}
          emptyTitle="Keine Leads gefunden"
          emptyDescription="Füge einen Lead hinzu oder passe die Suche an."
        />
      </Panel>

      {/* Add lead modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Lead hinzufügen"
        description="Neuen Interessenten manuell erfassen."
        size="sm"
        footer={
          <>
            <AdminButton variant="ghost" size="sm" onClick={() => setAddOpen(false)}>
              Abbrechen
            </AdminButton>
            <AdminButton
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={handleCreate}
              loading={pending}
              disabled={!email.trim()}
            >
              Hinzufügen
            </AdminButton>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="tac-label">E-Mail *</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@beispiel.de"
              className="w-full rounded-lg border border-white/10 bg-obsidian/60 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-300/40 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="tac-label">Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Vor- und Nachname"
              className="w-full rounded-lg border border-white/10 bg-obsidian/60 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-300/40 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="tac-label">Quelle</span>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-obsidian/60 px-3 py-2 text-sm text-cream focus:border-gold-300/40 focus:outline-none"
            >
              {SOURCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-ink text-cream">
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        title="Lead löschen?"
        description="Diese Aktion kann nicht rückgängig gemacht werden."
        size="sm"
        footer={
          <>
            <AdminButton variant="ghost" size="sm" onClick={() => setToDelete(null)}>
              Abbrechen
            </AdminButton>
            <AdminButton
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={handleDelete}
              loading={pending}
            >
              Endgültig löschen
            </AdminButton>
          </>
        }
      >
        <p className="text-sm text-cream/70">
          Der Lead <span className="font-bold text-cream">{toDelete?.email}</span> wird
          dauerhaft entfernt.
        </p>
      </Modal>
    </>
  );
}
