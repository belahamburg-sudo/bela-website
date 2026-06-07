"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  GripVertical,
  Layers,
  Pencil,
  PlayCircle,
  Plus,
  Trash2,
  Video,
} from "lucide-react";
import { Panel, AdminBadge, EmptyState } from "@/components/admin/ui";
import { AdminButton } from "@/components/admin/admin-button";
import { Modal } from "@/components/admin/modal";
import { useToast } from "@/components/admin/toast";
import {
  createModule,
  updateModule,
  deleteModule,
  reorderModules,
  deleteLesson,
  reorderLessons,
} from "@/app/admin/kurse/actions";
import type { EditorLesson, EditorModule } from "./course-editor";
import { LessonModal } from "./lesson-modal";

const inputClass =
  "w-full rounded-lg border border-white/10 bg-obsidian/60 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-300/40 focus:outline-none";

export function CurriculumEditor({
  courseId,
  modules,
}: {
  courseId: string;
  modules: EditorModule[];
}) {
  const router = useRouter();
  const { success, error } = useToast();
  const [pending, startTransition] = useTransition();

  const [addingModule, setAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [renaming, setRenaming] = useState<EditorModule | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deletingModule, setDeletingModule] = useState<EditorModule | null>(null);

  const [lessonModal, setLessonModal] = useState<{
    moduleId: string;
    lesson: EditorLesson | null;
  } | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<{
    lesson: EditorLesson;
  } | null>(null);

  function run(action: () => Promise<{ ok: boolean; error?: string }>, okMsg?: string) {
    startTransition(async () => {
      const res = await action();
      if (res.ok) {
        if (okMsg) success(okMsg);
        router.refresh();
      } else {
        error(res.error ?? "Aktion fehlgeschlagen.");
      }
    });
  }

  function handleAddModule() {
    if (!newModuleTitle.trim()) {
      error("Modultitel ist erforderlich.");
      return;
    }
    startTransition(async () => {
      const res = await createModule({ courseId, title: newModuleTitle });
      if (res.ok) {
        success("Modul erstellt.");
        setAddingModule(false);
        setNewModuleTitle("");
        router.refresh();
      } else {
        error(res.error ?? "Konnte Modul nicht erstellen.");
      }
    });
  }

  function handleRename() {
    if (!renaming) return;
    const mod = renaming;
    run(
      () => updateModule({ id: mod.id, courseId, title: renameValue }),
      "Modul umbenannt."
    );
    setRenaming(null);
  }

  function moveModule(index: number, dir: "up" | "down") {
    const target = index + (dir === "up" ? -1 : 1);
    if (target < 0 || target >= modules.length) return;
    const ids = modules.map((m) => m.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    run(() => reorderModules({ courseId, orderedIds: ids }));
  }

  function moveLesson(mod: EditorModule, index: number, dir: "up" | "down") {
    const target = index + (dir === "up" ? -1 : 1);
    if (target < 0 || target >= mod.lessons.length) return;
    const ids = mod.lessons.map((l) => l.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    run(() => reorderLessons({ moduleId: mod.id, courseId, orderedIds: ids }));
  }

  return (
    <>
      <Panel
        title="Lehrplan"
        description="Module und Lektionen — Videos und Downloads pro Lektion."
        actions={
          <AdminButton variant="primary" size="sm" icon={Plus} onClick={() => setAddingModule(true)}>
            Modul hinzufügen
          </AdminButton>
        }
        noPadding
      >
        {modules.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="Noch kein Lehrplan"
            description="Lege ein erstes Modul an, um Lektionen hinzuzufügen."
          />
        ) : (
          <div className="divide-y divide-white/5">
            {modules.map((mod, mi) => (
              <div key={mod.id} className="p-4 sm:p-5">
                {/* Module header */}
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex flex-col">
                    <button
                      onClick={() => moveModule(mi, "up")}
                      disabled={pending || mi === 0}
                      className="text-cream/30 transition-colors hover:text-gold-300 disabled:opacity-20"
                      aria-label="Modul nach oben"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => moveModule(mi, "down")}
                      disabled={pending || mi === modules.length - 1}
                      className="text-cream/30 transition-colors hover:text-gold-300 disabled:opacity-20"
                      aria-label="Modul nach unten"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border border-gold-300/20 bg-gold-300/[0.06] text-[11px] font-bold text-gold-300">
                    {mi + 1}
                  </span>
                  <h3 className="min-w-0 flex-1 truncate text-sm font-bold text-cream/90">
                    {mod.title}
                  </h3>
                  <AdminBadge tone="neutral">
                    {mod.lessons.length} {mod.lessons.length === 1 ? "Lektion" : "Lektionen"}
                  </AdminBadge>
                  <AdminButton
                    variant="ghost"
                    size="sm"
                    icon={Pencil}
                    onClick={() => {
                      setRenaming(mod);
                      setRenameValue(mod.title);
                    }}
                  >
                    Umbenennen
                  </AdminButton>
                  <AdminButton
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    onClick={() => setDeletingModule(mod)}
                  >
                    Löschen
                  </AdminButton>
                </div>

                {/* Lessons */}
                <div className="ml-8 flex flex-col gap-2">
                  {mod.lessons.map((lesson, li) => (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-3 rounded-lg border border-white/8 bg-obsidian/40 px-3 py-2.5"
                    >
                      <GripVertical className="h-4 w-4 flex-shrink-0 text-cream/15" />
                      {lesson.videoUrl ? (
                        <PlayCircle className="h-4 w-4 flex-shrink-0 text-gold-300/70" />
                      ) : (
                        <Video className="h-4 w-4 flex-shrink-0 text-cream/25" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-cream/85">{lesson.title}</p>
                        <p className="flex items-center gap-2 text-[11px] text-cream/35">
                          {lesson.duration || "—"}
                          {lesson.resources.length > 0 && (
                            <span className="inline-flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {lesson.resources.length}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-1">
                        <button
                          onClick={() => moveLesson(mod, li, "up")}
                          disabled={pending || li === 0}
                          className="text-cream/30 transition-colors hover:text-gold-300 disabled:opacity-20"
                          aria-label="Lektion nach oben"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => moveLesson(mod, li, "down")}
                          disabled={pending || li === mod.lessons.length - 1}
                          className="text-cream/30 transition-colors hover:text-gold-300 disabled:opacity-20"
                          aria-label="Lektion nach unten"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                        <AdminButton
                          variant="ghost"
                          size="sm"
                          icon={Pencil}
                          onClick={() => setLessonModal({ moduleId: mod.id, lesson })}
                        >
                          Bearbeiten
                        </AdminButton>
                        <button
                          onClick={() => setDeletingLesson({ lesson })}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-cream/30 transition-colors hover:bg-red-500/10 hover:text-red-300"
                          aria-label="Lektion löschen"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => setLessonModal({ moduleId: mod.id, lesson: null })}
                    className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-white/10 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-cream/40 transition-colors hover:border-gold-300/30 hover:text-gold-300"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Lektion hinzufügen
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* Add module */}
      <Modal
        open={addingModule}
        onClose={() => setAddingModule(false)}
        title="Neues Modul"
        size="sm"
        footer={
          <>
            <AdminButton variant="ghost" size="sm" onClick={() => setAddingModule(false)} disabled={pending}>
              Abbrechen
            </AdminButton>
            <AdminButton variant="primary" size="sm" onClick={handleAddModule} loading={pending}>
              Erstellen
            </AdminButton>
          </>
        }
      >
        <label className="block">
          <span className="tac-label mb-1.5 block">Modultitel *</span>
          <input
            autoFocus
            value={newModuleTitle}
            onChange={(e) => setNewModuleTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddModule();
            }}
            placeholder="z. B. Von Idee zu Goldmine"
            className={inputClass}
          />
        </label>
      </Modal>

      {/* Rename module */}
      <Modal
        open={Boolean(renaming)}
        onClose={() => setRenaming(null)}
        title="Modul umbenennen"
        size="sm"
        footer={
          <>
            <AdminButton variant="ghost" size="sm" onClick={() => setRenaming(null)} disabled={pending}>
              Abbrechen
            </AdminButton>
            <AdminButton variant="primary" size="sm" onClick={handleRename} loading={pending}>
              Speichern
            </AdminButton>
          </>
        }
      >
        <label className="block">
          <span className="tac-label mb-1.5 block">Modultitel *</span>
          <input
            autoFocus
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename();
            }}
            className={inputClass}
          />
        </label>
      </Modal>

      {/* Delete module */}
      <Modal
        open={Boolean(deletingModule)}
        onClose={() => setDeletingModule(null)}
        title="Modul löschen?"
        description="Alle Lektionen in diesem Modul werden ebenfalls gelöscht."
        size="sm"
        footer={
          <>
            <AdminButton variant="ghost" size="sm" onClick={() => setDeletingModule(null)}>
              Abbrechen
            </AdminButton>
            <AdminButton
              variant="danger"
              size="sm"
              icon={Trash2}
              loading={pending}
              onClick={() => {
                if (!deletingModule) return;
                const id = deletingModule.id;
                run(() => deleteModule({ id, courseId }), "Modul gelöscht.");
                setDeletingModule(null);
              }}
            >
              Löschen
            </AdminButton>
          </>
        }
      >
        <p className="text-sm text-cream/70">
          <span className="font-bold text-cream">{deletingModule?.title}</span> wird mit allen
          Lektionen entfernt.
        </p>
      </Modal>

      {/* Delete lesson */}
      <Modal
        open={Boolean(deletingLesson)}
        onClose={() => setDeletingLesson(null)}
        title="Lektion löschen?"
        size="sm"
        footer={
          <>
            <AdminButton variant="ghost" size="sm" onClick={() => setDeletingLesson(null)}>
              Abbrechen
            </AdminButton>
            <AdminButton
              variant="danger"
              size="sm"
              icon={Trash2}
              loading={pending}
              onClick={() => {
                if (!deletingLesson) return;
                const id = deletingLesson.lesson.id;
                run(() => deleteLesson({ id, courseId }), "Lektion gelöscht.");
                setDeletingLesson(null);
              }}
            >
              Löschen
            </AdminButton>
          </>
        }
      >
        <p className="text-sm text-cream/70">
          <span className="font-bold text-cream">{deletingLesson?.lesson.title}</span> wird
          dauerhaft entfernt.
        </p>
      </Modal>

      {/* Lesson create/edit */}
      {lessonModal && (
        <LessonModal
          open={Boolean(lessonModal)}
          courseId={courseId}
          moduleId={lessonModal.moduleId}
          lesson={lessonModal.lesson}
          onClose={() => setLessonModal(null)}
          onSaved={() => {
            setLessonModal(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
