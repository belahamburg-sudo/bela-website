"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Settings2 } from "lucide-react";
import { Panel } from "@/components/admin/ui";
import { DataTable, type Column } from "@/components/admin/data-table";
import { AdminButton } from "@/components/admin/admin-button";
import { Modal } from "@/components/admin/modal";
import { useToast } from "@/components/admin/toast";
import { upsertSetting, deleteSetting } from "@/app/admin/einstellungen/actions";

export type RawSettingRow = {
  key: string;
  value: unknown;
  updatedAt: string | null;
};

const inputClass =
  "w-full rounded-lg border border-white/10 bg-obsidian/60 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-300/40 focus:outline-none";

function stringify(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function formatDate(iso: string | null): string {
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

export function SettingsRawEditor({ rows }: { rows: RawSettingRow[] }) {
  const router = useRouter();
  const { success, error } = useToast();
  const [pending, startTransition] = useTransition();

  const [editing, setEditing] = useState<RawSettingRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState<RawSettingRow | null>(null);

  const [keyInput, setKeyInput] = useState("");
  const [jsonInput, setJsonInput] = useState("{\n  \n}");

  function openCreate() {
    setKeyInput("");
    setJsonInput("{\n  \n}");
    setCreating(true);
  }

  function openEdit(row: RawSettingRow) {
    setKeyInput(row.key);
    setJsonInput(stringify(row.value));
    setEditing(row);
  }

  function closeForm() {
    setCreating(false);
    setEditing(null);
  }

  function handleSave() {
    const key = keyInput.trim();
    if (!key) {
      error("Schlüssel ist erforderlich.");
      return;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonInput);
    } catch {
      error("Ungültiges JSON. Bitte Syntax prüfen.");
      return;
    }
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      error("Wert muss ein JSON-Objekt sein (z. B. {\"text\": \"…\"}).");
      return;
    }
    const value = parsed as Record<string, unknown>;
    startTransition(async () => {
      const res = await upsertSetting({ key, value });
      if (res.ok) {
        success(editing ? "Einstellung aktualisiert." : "Einstellung hinzugefügt.");
        closeForm();
        router.refresh();
      } else {
        error(res.error ?? "Speichern fehlgeschlagen.");
      }
    });
  }

  function handleDelete() {
    if (!toDelete) return;
    const key = toDelete.key;
    startTransition(async () => {
      const res = await deleteSetting(key);
      if (res.ok) {
        success("Einstellung gelöscht.");
        setToDelete(null);
        router.refresh();
      } else {
        error(res.error ?? "Löschen fehlgeschlagen.");
      }
    });
  }

  const columns: Column<RawSettingRow>[] = [
    {
      key: "key",
      header: "Schlüssel",
      render: (r) => <span className="font-mono text-xs text-cream/90">{r.key}</span>,
    },
    {
      key: "value",
      header: "Wert",
      render: (r) => (
        <span className="block max-w-md truncate font-mono text-xs text-cream/50">
          {stringify(r.value).replace(/\s+/g, " ")}
        </span>
      ),
    },
    {
      key: "updatedAt",
      header: "Geändert",
      render: (r) => <span className="text-cream/50">{formatDate(r.updatedAt)}</span>,
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
        title="Alle Einstellungen"
        description="Roh-Editor für jede gespeicherte Einstellung (JSON)."
        noPadding
        actions={
          <AdminButton variant="secondary" size="sm" icon={Plus} onClick={openCreate}>
            Einstellung hinzufügen
          </AdminButton>
        }
      >
        <DataTable
          columns={columns}
          rows={rows}
          getRowKey={(r) => r.key}
          emptyIcon={Settings2}
          emptyTitle="Keine Einstellungen"
          emptyDescription="Es sind noch keine Einstellungen gespeichert."
        />
      </Panel>

      {/* Create / edit */}
      <Modal
        open={formOpen}
        onClose={closeForm}
        title={editing ? "Einstellung bearbeiten" : "Einstellung hinzufügen"}
        description="Der Wert muss ein gültiges JSON-Objekt sein."
        size="lg"
        footer={
          <>
            <AdminButton variant="ghost" size="sm" onClick={closeForm} disabled={pending}>
              Abbrechen
            </AdminButton>
            <AdminButton variant="primary" size="sm" onClick={handleSave} loading={pending}>
              Speichern
            </AdminButton>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <label className="block">
            <span className="tac-label mb-1.5 block">Schlüssel *</span>
            <input
              type="text"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="z. B. hero_headline"
              disabled={Boolean(editing)}
              className={`${inputClass} font-mono disabled:opacity-50`}
            />
            {editing && (
              <span className="mt-1 block text-xs text-cream/30">
                Der Schlüssel kann nicht geändert werden.
              </span>
            )}
          </label>

          <label className="block">
            <span className="tac-label mb-1.5 block">Wert (JSON)</span>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              rows={8}
              spellCheck={false}
              className={`${inputClass} resize-y font-mono text-xs`}
            />
            <span className="mt-1 block text-xs text-cream/30">
              Beispiel: {"{"}&quot;text&quot;: &quot;Mein Text&quot;{"}"}
            </span>
          </label>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        title="Einstellung löschen?"
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
          Die Einstellung{" "}
          <span className="font-mono font-bold text-cream">{toDelete?.key}</span> wird
          dauerhaft entfernt.
        </p>
      </Modal>
    </>
  );
}
