"use client";

import { useEffect, useState, useTransition } from "react";
import { FileVideo, Link2, Plus, Trash2, Upload, X } from "lucide-react";
import { AdminButton } from "@/components/admin/admin-button";
import { Modal } from "@/components/admin/modal";
import { FileUpload } from "@/components/admin/file-upload";
import { StoragePicker } from "@/components/admin/storage-picker";
import { useToast } from "@/components/admin/toast";
import { createLesson, updateLesson } from "@/app/admin/kurse/actions";
import type { EditorLesson, ResourceItem } from "./course-editor";

const inputClass =
  "w-full rounded-lg border border-white/10 bg-obsidian/60 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-300/40 focus:outline-none";

const RESOURCE_TYPES: ResourceItem["type"][] = [
  "PDF",
  "Template",
  "Prompt",
  "XLSX",
  "TXT",
  "HTML",
];

export function LessonModal({
  open,
  courseId,
  courseSlug,
  moduleId,
  lesson,
  onClose,
  onSaved,
}: {
  open: boolean;
  courseId: string;
  courseSlug: string;
  moduleId: string;
  lesson: EditorLesson | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { success, error } = useToast();
  const [pending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [resources, setResources] = useState<ResourceItem[]>([]);

  useEffect(() => {
    if (!open) return;
    setTitle(lesson?.title ?? "");
    setDuration(lesson?.duration ?? "");
    setDescription(lesson?.description ?? "");
    setVideoUrl(lesson?.videoUrl ?? "");
    setResources(lesson?.resources ?? []);
  }, [open, lesson?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const isUploadedVideo = videoUrl.startsWith("storage://");

  function updateResource(index: number, patch: Partial<ResourceItem>) {
    setResources((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function addResource() {
    setResources((prev) => [...prev, { label: "", type: "PDF", href: "" }]);
  }

  function removeResource(index: number) {
    setResources((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSave() {
    if (!title.trim()) {
      error("Lektionstitel ist erforderlich.");
      return;
    }
    const cleanResources = resources
      .map((r) => ({ ...r, label: r.label.trim(), href: r.href.trim() }))
      .filter((r) => r.label && r.href);

    startTransition(async () => {
      const payload = {
        courseId,
        title,
        duration,
        description,
        videoUrl,
        resources: cleanResources,
      };
      const res = lesson
        ? await updateLesson({ id: lesson.id, ...payload })
        : await createLesson({ moduleId, ...payload });
      if (res.ok) {
        success(lesson ? "Lektion aktualisiert." : "Lektion erstellt.");
        onSaved();
      } else {
        error(res.error ?? "Speichern fehlgeschlagen.");
      }
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={lesson ? "Lektion bearbeiten" : "Neue Lektion"}
      description="Titel, Video und Downloads für diese Lektion."
      size="lg"
      footer={
        <>
          <AdminButton variant="ghost" size="sm" onClick={onClose} disabled={pending}>
            Abbrechen
          </AdminButton>
          <AdminButton variant="primary" size="sm" onClick={handleSave} loading={pending}>
            {lesson ? "Speichern" : "Erstellen"}
          </AdminButton>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
          <label className="block">
            <span className="tac-label mb-1.5 block">Titel *</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
          </label>
          <label className="block">
            <span className="tac-label mb-1.5 block">Dauer</span>
            <input
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="12 Min."
              className={inputClass}
            />
          </label>
        </div>

        <label className="block">
          <span className="tac-label mb-1.5 block">Beschreibung</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={`${inputClass} resize-y`}
          />
        </label>

        {/* Video */}
        <div className="rounded-xl border border-white/10 bg-obsidian/30 p-4">
          <div className="mb-3 flex items-center gap-2">
            <FileVideo className="h-4 w-4 text-gold-300/70" />
            <span className="text-sm font-bold text-cream/80">Video</span>
          </div>

          {isUploadedVideo ? (
            <div className="mb-3 flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/[0.04] px-3 py-2.5">
              <Upload className="h-4 w-4 flex-shrink-0 text-emerald-400" />
              <span className="min-w-0 flex-1 truncate text-sm text-cream/80">
                Hochgeladenes Video gespeichert
              </span>
              <button
                onClick={() => setVideoUrl("")}
                className="flex-shrink-0 text-cream/40 transition-colors hover:text-cream"
                aria-label="Video entfernen"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="mb-3 block">
              <span className="mb-1.5 flex items-center gap-1.5 text-xs text-cream/40">
                <Link2 className="h-3 w-3" />
                Embed-URL (YouTube, Vimeo …)
              </span>
              <input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/embed/…"
                className={inputClass}
              />
            </label>
          )}

          <FileUpload
            bucket="course-content"
            prefix={`${courseSlug}/videos`}
            kind="video"
            accept="video/*"
            label={isUploadedVideo ? "Anderes Video hochladen" : "oder Video hochladen"}
            hint="MP4/WebM bis 2 GB — direkt & privat gespeichert"
            onUploaded={(f) => {
              setVideoUrl(f.ref);
              success("Video hochgeladen.");
            }}
          />

          <StoragePicker
            kind="video"
            buttonLabel="oder bereits hochgeladenes Video aus Supabase wählen"
            onSelect={(ref) => {
              setVideoUrl(ref);
              success("Video ausgewählt.");
            }}
          />
        </div>

        {/* Resources */}
        <div className="rounded-xl border border-white/10 bg-obsidian/30 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-bold text-cream/80">Downloads (PDF, Templates …)</span>
            <AdminButton variant="ghost" size="sm" icon={Plus} onClick={addResource}>
              Hinzufügen
            </AdminButton>
          </div>

          {resources.length === 0 ? (
            <p className="text-xs text-cream/30">Noch keine Downloads.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {resources.map((r, i) => (
                <div key={i} className="rounded-lg border border-white/10 bg-obsidian/40 p-3">
                  <div className="grid gap-2.5 sm:grid-cols-[120px_1fr_auto]">
                    <select
                      value={r.type}
                      onChange={(e) =>
                        updateResource(i, { type: e.target.value as ResourceItem["type"] })
                      }
                      className={inputClass}
                    >
                      {RESOURCE_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <input
                      value={r.label}
                      onChange={(e) => updateResource(i, { label: e.target.value })}
                      placeholder="Bezeichnung (z. B. Arbeitsblatt)"
                      className={inputClass}
                    />
                    <button
                      onClick={() => removeResource(i)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-cream/40 transition-colors hover:border-red-500/40 hover:text-red-300"
                      aria-label="Download entfernen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-2.5">
                    {r.href ? (
                      <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.03] px-3 py-2 text-xs text-cream/60">
                        <Upload className="h-3.5 w-3.5 flex-shrink-0 text-emerald-400/80" />
                        <span className="min-w-0 flex-1 truncate">
                          {r.href.startsWith("storage://") ? "Datei hochgeladen" : r.href}
                        </span>
                        <button
                          onClick={() => updateResource(i, { href: "" })}
                          className="flex-shrink-0 text-cream/40 hover:text-cream"
                          aria-label="Datei entfernen"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <FileUpload
                          bucket="course-content"
                          prefix={`${courseSlug}/downloads`}
                          kind="pdf"
                          label="Datei hochladen oder unten URL eintragen"
                          hint="PDF, TXT, HTML, ZIP — beliebige Datei"
                          onUploaded={(f) => {
                            updateResource(i, { href: f.ref });
                            success("Datei hochgeladen.");
                          }}
                        />
                        <StoragePicker
                          buttonLabel="oder aus Supabase wählen"
                          onSelect={(ref) => {
                            updateResource(i, { href: ref });
                            success("Datei ausgewählt.");
                          }}
                        />
                      </>
                    )}
                    {!r.href.startsWith("storage://") && (
                      <input
                        value={r.href}
                        onChange={(e) => updateResource(i, { href: e.target.value })}
                        placeholder="oder externe URL: https://…"
                        className={`${inputClass} mt-2`}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
