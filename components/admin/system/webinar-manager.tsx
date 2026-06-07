"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Info,
} from "lucide-react";
import { Panel, AdminBadge } from "@/components/admin/ui";
import { DataTable, type Column } from "@/components/admin/data-table";
import { AdminButton } from "@/components/admin/admin-button";
import { Modal } from "@/components/admin/modal";
import { useToast } from "@/components/admin/toast";
import {
  createWebinar,
  updateWebinar,
  deleteWebinar,
  toggleWebinarActive,
} from "@/app/admin/webinar/actions";

export type WebinarRow = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  startsAt: string | null;
  url: string | null;
  isActive: boolean;
  createdAt: string;
};

type FormState = {
  title: string;
  subtitle: string;
  description: string;
  startsAt: string;
  url: string;
  isActive: boolean;
};

const EMPTY_FORM: FormState = {
  title: "",
  subtitle: "",
  description: "",
  startsAt: "",
  url: "",
  isActive: false,
};

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
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

/** Convert an ISO timestamp into the value a <input type="datetime-local"> expects. */
function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const inputClass =
  "w-full rounded-lg border border-white/10 bg-obsidian/60 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-300/40 focus:outline-none";

export function WebinarManager({ rows }: { rows: WebinarRow[] }) {
  const router = useRouter();
  const { success, error } = useToast();
  const [pending, startTransition] = useTransition();

  const [editing, setEditing] = useState<WebinarRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState<WebinarRow | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  function openCreate() {
    setForm(EMPTY_FORM);
    setCreating(true);
  }

  function openEdit(row: WebinarRow) {
    setForm({
      title: row.title,
      subtitle: row.subtitle ?? "",
      description: row.description ?? "",
      startsAt: toDatetimeLocal(row.startsAt),
      url: row.url ?? "",
      isActive: row.isActive,
    });
    setEditing(row);
  }

  function closeForm() {
    setCreating(false);
    setEditing(null);
  }

  function handleSubmit() {
    if (!form.title.trim()) {
      error("Titel ist erforderlich.");
      return;
    }
    const payload = {
      title: form.title,
      subtitle: form.subtitle,
      description: form.description,
      startsAt: form.startsAt,
      url: form.url,
      isActive: form.isActive,
    };
    startTransition(async () => {
      const res = editing
        ? await updateWebinar({ id: editing.id, ...payload })
        : await createWebinar(payload);
      if (res.ok) {
        success(editing ? "Webinar aktualisiert." : "Webinar erstellt.");
        closeForm();
        router.refresh();
      } else {
        error(res.error ?? "Aktion fehlgeschlagen.");
      }
    });
  }

  function handleToggle(row: WebinarRow) {
    startTransition(async () => {
      const res = await toggleWebinarActive({ id: row.id, isActive: !row.isActive });
      if (res.ok) {
        success(row.isActive ? "Webinar deaktiviert." : "Webinar aktiviert.");
        router.refresh();
      } else {
        error(res.error ?? "Aktion fehlgeschlagen.");
      }
    });
  }

  function handleDelete() {
    if (!toDelete) return;
    const id = toDelete.id;
    startTransition(async () => {
      const res = await deleteWebinar(id);
      if (res.ok) {
        success("Webinar gelöscht.");
        setToDelete(null);
        router.refresh();
      } else {
        error(res.error ?? "Löschen fehlgeschlagen.");
      }
    });
  }

  const columns: Column<WebinarRow>[] = [
    {
      key: "title",
      header: "Titel",
      render: (r) => <span className="font-medium text-cream/90">{r.title}</span>,
    },
    {
      key: "subtitle",
      header: "Untertitel",
      render: (r) => <span className="text-cream/60">{r.subtitle ?? "—"}</span>,
    },
    {
      key: "startsAt",
      header: "Start",
      render: (r) => <span className="text-cream/60">{formatDateTime(r.startsAt)}</span>,
    },
    {
      key: "isActive",
      header: "Aktiv",
      render: (r) => (
        <button onClick={() => handleToggle(r)} disabled={pending} title="Status umschalten">
          <AdminBadge tone={r.isActive ? "green" : "neutral"}>
            {r.isActive ? "Aktiv" : "Inaktiv"}
          </AdminBadge>
        </button>
      ),
    },
    {
      key: "url",
      header: "URL",
      render: (r) =>
        r.url ? (
          <a
            href={r.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex max-w-[16rem] items-center gap-1 truncate text-gold-300/80 hover:text-gold-300"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="truncate">{r.url}</span>
            <ExternalLink className="h-3 w-3 flex-shrink-0" />
          </a>
        ) : (
          <span className="text-cream/30">—</span>
        ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (r) => (
        <div className="flex items-center justify-end gap-1.5">
          <AdminButton variant="ghost" size="sm" icon={Pencil} onClick={() => openEdit(r)}>
            Bearbeiten
          </AdminButton>
          <AdminButton
            variant="ghost"
            size="sm"
            icon={Trash2}
            onClick={() => setToDelete(r)}
          >
            Löschen
          </AdminButton>
        </div>
      ),
    },
  ];

  const formOpen = creating || Boolean(editing);

  return (
    <>
      <Panel
        title="Webinare"
        description={`${rows.length} ${rows.length === 1 ? "Webinar" : "Webinare"}`}
        noPadding
        actions={
          <AdminButton variant="primary" size="sm" icon={Plus} onClick={openCreate}>
            Neues Webinar
          </AdminButton>
        }
      >
        <div className="flex items-start gap-2 border-b border-white/5 px-5 py-3 text-xs text-cream/40">
          <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gold-300/50" />
          <span>
            Nur als <span className="font-bold text-cream/70">aktiv</span> markierte
            Webinare werden öffentlich auf der Website angezeigt.
          </span>
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          getRowKey={(r) => r.id}
          emptyIcon={CalendarClock}
          emptyTitle="Noch keine Webinare"
          emptyDescription="Lege dein erstes Webinar an."
        />
      </Panel>

      {/* Create / edit form */}
      <Modal
        open={formOpen}
        onClose={closeForm}
        title={editing ? "Webinar bearbeiten" : "Neues Webinar"}
        description={
          editing
            ? "Aktualisiere die Details dieses Webinars."
            : "Lege ein neues Webinar an."
        }
        size="lg"
        footer={
          <>
            <AdminButton variant="ghost" size="sm" onClick={closeForm} disabled={pending}>
              Abbrechen
            </AdminButton>
            <AdminButton
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              loading={pending}
            >
              {editing ? "Speichern" : "Erstellen"}
            </AdminButton>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <label className="block">
            <span className="tac-label mb-1.5 block">Titel *</span>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="z. B. Live-Webinar: KI-Goldmine starten"
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="tac-label mb-1.5 block">Untertitel</span>
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              placeholder="Kurzer Untertitel"
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="tac-label mb-1.5 block">Beschreibung</span>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Worum geht es im Webinar?"
              rows={4}
              className={`${inputClass} resize-y`}
            />
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="tac-label mb-1.5 block">Startzeitpunkt</span>
              <input
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                className={`${inputClass} [color-scheme:dark]`}
              />
            </label>

            <label className="block">
              <span className="tac-label mb-1.5 block">URL</span>
              <input
                type="url"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://…"
                className={inputClass}
              />
            </label>
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-obsidian/40 px-4 py-3">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-white/20 bg-obsidian text-gold-300 accent-gold-300 focus:ring-gold-300/40"
            />
            <span className="text-sm text-cream/80">
              Aktiv —{" "}
              <span className="text-cream/40">öffentlich auf der Website sichtbar</span>
            </span>
          </label>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        title="Webinar löschen?"
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
          Das Webinar{" "}
          <span className="font-bold text-cream">{toDelete?.title}</span> wird dauerhaft
          entfernt.
        </p>
      </Modal>
    </>
  );
}
