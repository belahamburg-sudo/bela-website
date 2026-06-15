"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Star,
  PlayCircle,
  FileText,
} from "lucide-react";
import { Panel, AdminBadge } from "@/components/admin/ui";
import { DataTable, type Column } from "@/components/admin/data-table";
import { AdminButton } from "@/components/admin/admin-button";
import { Modal } from "@/components/admin/modal";
import { useToast } from "@/components/admin/toast";
import { formatEuro } from "@/lib/utils";
import {
  createCourse,
  deleteCourse,
  toggleCourseActive,
} from "@/app/admin/kurse/actions";

export type CourseRow = {
  id: string;
  slug: string;
  title: string;
  priceCents: number;
  level: string | null;
  format: "video" | "pdf";
  featured: boolean;
  isActive: boolean;
  moduleCount: number;
  lessonCount: number;
};

const inputClass =
  "w-full rounded-lg border border-white/10 bg-obsidian/60 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-300/40 focus:outline-none";

export function CoursesList({ rows }: { rows: CourseRow[] }) {
  const router = useRouter();
  const { success, error } = useToast();
  const [pending, startTransition] = useTransition();

  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [toDelete, setToDelete] = useState<CourseRow | null>(null);

  function handleCreate() {
    if (!newTitle.trim()) {
      error("Titel ist erforderlich.");
      return;
    }
    startTransition(async () => {
      const res = await createCourse({ title: newTitle });
      if (res.ok && res.id) {
        success("Kurs erstellt.");
        setCreating(false);
        setNewTitle("");
        router.push(`/admin/kurse/${res.id}`);
      } else {
        error(res.error ?? "Konnte Kurs nicht erstellen.");
      }
    });
  }

  function handleToggle(row: CourseRow) {
    startTransition(async () => {
      const res = await toggleCourseActive({ id: row.id, isActive: !row.isActive });
      if (res.ok) {
        success(row.isActive ? "Kurs deaktiviert." : "Kurs aktiviert.");
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
      const res = await deleteCourse(id);
      if (res.ok) {
        success("Kurs gelöscht.");
        setToDelete(null);
        router.refresh();
      } else {
        error(res.error ?? "Löschen fehlgeschlagen.");
      }
    });
  }

  const columns: Column<CourseRow>[] = [
    {
      key: "title",
      header: "Kurs",
      render: (r) => (
        <Link
          href={`/admin/kurse/${r.id}`}
          className="group inline-flex flex-col gap-0.5"
        >
          <span className="inline-flex items-center gap-2 font-medium text-cream/90 group-hover:text-gold-300">
            {r.featured && <Star className="h-3 w-3 flex-shrink-0 fill-gold-300 text-gold-300" />}
            {r.title}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-cream/30">
            {r.slug}
          </span>
        </Link>
      ),
    },
    {
      key: "format",
      header: "Format",
      render: (r) => (
        <span className="inline-flex items-center gap-1.5 text-cream/60">
          {r.format === "pdf" ? (
            <FileText className="h-3.5 w-3.5 text-gold-300/60" />
          ) : (
            <PlayCircle className="h-3.5 w-3.5 text-gold-300/60" />
          )}
          {r.format === "pdf" ? "PDF" : "Video"}
        </span>
      ),
    },
    {
      key: "level",
      header: "Level",
      render: (r) => <span className="text-cream/60">{r.level ?? "—"}</span>,
    },
    {
      key: "content",
      header: "Inhalt",
      render: (r) => (
        <span className="text-cream/60">
          {r.moduleCount} Mod. · {r.lessonCount} Lekt.
        </span>
      ),
    },
    {
      key: "price",
      header: "Preis",
      render: (r) => <span className="text-cream/80">{formatEuro(r.priceCents)}</span>,
    },
    {
      key: "isActive",
      header: "Status",
      render: (r) => (
        <button onClick={() => handleToggle(r)} disabled={pending} title="Status umschalten">
          <AdminBadge tone={r.isActive ? "green" : "neutral"}>
            {r.isActive ? "Aktiv" : "Entwurf"}
          </AdminBadge>
        </button>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (r) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link href={`/admin/kurse/${r.id}`}>
            <AdminButton variant="ghost" size="sm" icon={Pencil}>
              Bearbeiten
            </AdminButton>
          </Link>
          <AdminButton variant="ghost" size="sm" icon={Trash2} onClick={() => setToDelete(r)}>
            Löschen
          </AdminButton>
        </div>
      ),
    },
  ];

  return (
    <>
      <Panel
        title="Alle Kurse"
        description={`${rows.length} ${rows.length === 1 ? "Kurs" : "Kurse"}`}
        noPadding
        actions={
          <AdminButton variant="primary" size="sm" icon={Plus} onClick={() => setCreating(true)}>
            Neuer Kurs
          </AdminButton>
        }
      >
        <DataTable
          columns={columns}
          rows={rows}
          getRowKey={(r) => r.id}
          emptyIcon={BookOpen}
          emptyTitle="Noch keine Kurse"
          emptyDescription="Lege deinen ersten Kurs an."
        />
      </Panel>

      {/* Create course */}
      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="Neuen Kurs anlegen"
        description="Gib einen Titel ein. Alle weiteren Details bearbeitest du danach."
        size="sm"
        footer={
          <>
            <AdminButton variant="ghost" size="sm" onClick={() => setCreating(false)} disabled={pending}>
              Abbrechen
            </AdminButton>
            <AdminButton variant="primary" size="sm" onClick={handleCreate} loading={pending}>
              Erstellen & bearbeiten
            </AdminButton>
          </>
        }
      >
        <label className="block">
          <span className="tac-label mb-1.5 block">Kurstitel *</span>
          <input
            type="text"
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
            }}
            placeholder="z. B. AI Goldmining Starter"
            className={inputClass}
          />
        </label>
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        title="Kurs löschen?"
        description="Diese Aktion kann nicht rückgängig gemacht werden."
        size="sm"
        footer={
          <>
            <AdminButton variant="ghost" size="sm" onClick={() => setToDelete(null)}>
              Abbrechen
            </AdminButton>
            <AdminButton variant="danger" size="sm" icon={Trash2} onClick={handleDelete} loading={pending}>
              Endgültig löschen
            </AdminButton>
          </>
        }
      >
        <p className="text-sm text-cream/70">
          Der Kurs <span className="font-bold text-cream">{toDelete?.title}</span> wird mit
          allen Modulen und Lektionen dauerhaft entfernt.
        </p>
      </Modal>
    </>
  );
}
