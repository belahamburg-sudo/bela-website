"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Download,
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

  // Accordion open-state: first module open by default.
  const [openModules, setOpenModules] = useState<Record<string, boolean>>(() =>
    modules.length > 0 ? { [modules[0].id]: true } : {}
  );

  const [lessonModal, setLessonModal] = useState<{
    moduleId: string;
    lesson: EditorLesson | null;
  } | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<{
    lesson: EditorLesson;
  } | null>(null);

  function toggleModule(id: string) {
    setOpenModules((prev) => ({ ...prev, [id]: !prev[id] }));
  }

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
        if (res.id) setOpenModules((prev) => ({ ...prev, [res.id as string]: true }));
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
            action={
              <AdminButton
                variant="secondary"
                size="sm"
                icon={Plus}
                onClick={() => setAddingModule(true)}
              >
                Erstes Modul
              </AdminButton>
            }
          />
        ) : (
          <div className="flex flex-col gap-3 p-4 sm:p-5">
            {modules.map((mod, mi) => {
              const isOpen = Boolean(openModules[mod.id]);
              const totalResources = mod.lessons.reduce(
                (sum, l) => sum + l.resources.length,
                0
              );
              return (
                <div
                  key={mod.id}
                  className={`overflow-hidden rounded-xl border bg-obsidian/30 transition-colors ${
                    isOpen ? "border-gold-300/25" : "border-white/10 hover:border-white/20"
                  }`}
                >
                  {/* ── Module header (accordion trigger) ── */}
                  <div className="flex items-center gap-2 px-3 py-3 sm:px-4">
                    {/* Reorder controls */}
                    <div className="flex flex-shrink-0 flex-col">
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

                    {/* Clickable header area */}
                    <button
                      type="button"
                      onClick={() => toggleModule(mod.id)}
                      aria-expanded={isOpen}
                      className="group flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <motion.span
                        animate={{ rotate: isOpen ? 0 : -90 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-cream/40 transition-colors group-hover:text-gold-300"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </motion.span>
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border border-gold-300/20 bg-gold-300/[0.06] text-[11px] font-bold text-gold-300">
                        {mi + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-cream/90 group-hover:text-cream">
                          {mod.title}
                        </span>
                        <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-wider text-cream/30">
                          Modul {mi + 1}
                        </span>
                      </span>
                    </button>

                    {/* Badges */}
                    <div className="hidden flex-shrink-0 items-center gap-1.5 sm:flex">
                      <AdminBadge tone={mod.lessons.length > 0 ? "gold" : "neutral"}>
                        {mod.lessons.length}{" "}
                        {mod.lessons.length === 1 ? "Lektion" : "Lektionen"}
                      </AdminBadge>
                      {totalResources > 0 && (
                        <AdminBadge tone="neutral">
                          <Download className="h-3 w-3" />
                          {totalResources}
                        </AdminBadge>
                      )}
                    </div>

                    {/* Module actions */}
                    <div className="flex flex-shrink-0 items-center gap-1">
                      <button
                        onClick={() => {
                          setRenaming(mod);
                          setRenameValue(mod.title);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-cream/30 transition-colors hover:bg-white/5 hover:text-gold-300"
                        aria-label="Modul umbenennen"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingModule(mod)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-cream/30 transition-colors hover:bg-red-500/10 hover:text-red-300"
                        aria-label="Modul löschen"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* ── Accordion body ── */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-white/5 px-3 py-3 sm:px-4">
                          <div className="flex flex-col gap-2">
                            {mod.lessons.length === 0 ? (
                              <p className="rounded-lg border border-dashed border-white/10 px-3 py-4 text-center text-xs text-cream/30">
                                Noch keine Lektionen in diesem Modul.
                              </p>
                            ) : (
                              mod.lessons.map((lesson, li) => (
                                <div
                                  key={lesson.id}
                                  className="rounded-lg border border-white/8 bg-obsidian/50 px-3 py-2.5 transition-colors hover:border-white/15"
                                >
                                  <div className="flex items-center gap-3">
                                    <GripVertical className="h-4 w-4 flex-shrink-0 text-cream/15" />
                                    {lesson.videoUrl ? (
                                      <PlayCircle className="h-4 w-4 flex-shrink-0 text-gold-300/70" />
                                    ) : (
                                      <Video className="h-4 w-4 flex-shrink-0 text-cream/25" />
                                    )}
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2">
                                        <p className="truncate text-sm text-cream/85">
                                          {lesson.title}
                                        </p>
                                        {lesson.videoUrl && (
                                          <AdminBadge tone="gold">Video</AdminBadge>
                                        )}
                                      </div>
                                      <p className="mt-0.5 flex items-center gap-2 text-[11px] text-cream/35">
                                        <span>{lesson.duration || "—"}</span>
                                        {lesson.resources.length > 0 && (
                                          <span className="inline-flex items-center gap-1">
                                            <FileText className="h-3 w-3" />
                                            {lesson.resources.length}{" "}
                                            {lesson.resources.length === 1
                                              ? "Download"
                                              : "Downloads"}
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
                                        onClick={() =>
                                          setLessonModal({ moduleId: mod.id, lesson })
                                        }
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

                                  {/* Resources list */}
                                  {lesson.resources.length > 0 && (
                                    <div className="mt-2.5 ml-7 flex flex-wrap gap-1.5 border-t border-white/5 pt-2.5">
                                      {lesson.resources.map((r, ri) => (
                                        <span
                                          key={ri}
                                          className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-obsidian/60 px-2 py-1 text-[11px] text-cream/60"
                                        >
                                          <FileText className="h-3 w-3 flex-shrink-0 text-gold-300/60" />
                                          <span className="max-w-[180px] truncate">
                                            {r.label}
                                          </span>
                                          <span className="rounded-sm bg-white/5 px-1 text-[9px] font-bold uppercase tracking-wider text-cream/35">
                                            {r.type}
                                          </span>
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))
                            )}

                            <button
                              onClick={() =>
                                setLessonModal({ moduleId: mod.id, lesson: null })
                              }
                              className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-white/10 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-cream/40 transition-colors hover:border-gold-300/30 hover:text-gold-300"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Lektion hinzufügen
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
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
