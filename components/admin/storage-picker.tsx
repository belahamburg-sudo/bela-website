"use client";

import { useState } from "react";
import { FolderSearch, Loader2, FileVideo, FileText, File as FileIcon } from "lucide-react";
import { Modal } from "@/components/admin/modal";
import { useToast } from "@/components/admin/toast";
import { listCourseContentFiles } from "@/app/admin/kurse/actions";

type Item = { path: string; name: string; size: number; ref: string };

const inputClass =
  "w-full rounded-lg border border-white/10 bg-obsidian/60 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-300/40 focus:outline-none";

function formatSize(b: number): string {
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  if (b < 1024 * 1024 * 1024) return `${(b / 1024 / 1024).toFixed(1)} MB`;
  return `${(b / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

const VIDEO_RE = /\.(mp4|mov|webm|m4v|mkv)$/i;

/**
 * Lets the admin attach a file that already exists in the course-content bucket
 * (e.g. uploaded directly via the Supabase dashboard) instead of re-uploading.
 * Calls onSelect with a portable storage:// ref.
 */
export function StoragePicker({
  onSelect,
  buttonLabel = "Aus Supabase wählen",
  kind,
}: {
  onSelect: (ref: string) => void;
  buttonLabel?: string;
  /** Pre-filters the list to videos / non-videos; both still searchable. */
  kind?: "video" | "file";
}) {
  const { error } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Item[] | null>(null);
  const [query, setQuery] = useState("");

  function openPicker() {
    setOpen(true);
    if (items) return;
    setLoading(true);
    listCourseContentFiles()
      .then((res) => {
        if (res.ok && res.files) setItems(res.files);
        else error(res.error ?? "Konnte Dateien nicht laden.");
      })
      .catch(() => error("Konnte Dateien nicht laden."))
      .finally(() => setLoading(false));
  }

  const filtered = (items ?? [])
    .filter((f) => (kind === "video" ? VIDEO_RE.test(f.name) : true))
    .filter((f) => f.path.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      <button
        type="button"
        onClick={openPicker}
        className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-cream/50 transition-colors hover:text-gold-300"
      >
        <FolderSearch className="h-3.5 w-3.5" />
        {buttonLabel}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Datei aus Supabase wählen" size="lg">
        <div className="space-y-3">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Suchen (Name oder Ordner) …"
            className={inputClass}
          />
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-cream/40">
              <Loader2 className="h-4 w-4 animate-spin" /> Dateien werden geladen …
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-cream/40">Keine Dateien gefunden.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {filtered.map((f) => {
                const isVideo = VIDEO_RE.test(f.name);
                const Icon = isVideo ? FileVideo : /\.pdf$/i.test(f.name) ? FileText : FileIcon;
                return (
                  <li key={f.path}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(f.ref);
                        setOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-lg border border-white/8 bg-obsidian/50 px-3 py-2.5 text-left transition-colors hover:border-gold-300/40 hover:bg-white/[0.03]"
                    >
                      <Icon className="h-4 w-4 flex-shrink-0 text-gold-300/70" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-cream/90">{f.name}</span>
                        <span className="block truncate text-[11px] text-cream/35">{f.path}</span>
                      </span>
                      <span className="flex-shrink-0 text-xs text-cream/40">{formatSize(f.size)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Modal>
    </>
  );
}
