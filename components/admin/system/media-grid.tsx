"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Link2,
  Code2,
  Trash2,
  FileIcon,
  ImageOff,
  RefreshCw,
  Folder,
} from "lucide-react";
import { AdminBadge, EmptyState } from "@/components/admin/ui";
import { AdminButton } from "@/components/admin/admin-button";
import { Modal } from "@/components/admin/modal";
import { useToast } from "@/components/admin/toast";
import {
  deleteMediaObject,
  replaceMediaObject,
} from "@/app/admin/medien/actions";

export type MediaItem = {
  name: string;
  path: string;
  ref: string;
  url: string | null;
  size: number;
  createdAt: string | null;
};

const VIDEO_EXT = ["mp4", "webm", "mov", "m4v", "ogv"];
const IMAGE_EXT = ["jpg", "jpeg", "png", "gif", "webp", "avif", "svg"];

function ext(name: string): string {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i + 1).toLowerCase();
}

function isVideo(name: string): boolean {
  return VIDEO_EXT.includes(ext(name));
}

function isImage(name: string): boolean {
  return IMAGE_EXT.includes(ext(name));
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** The folder portion of a full object path, e.g. "courses/slug" for
 *  "courses/slug/cover.png". Empty for files at the bucket root. */
function folderOf(path: string): string {
  const i = path.lastIndexOf("/");
  return i === -1 ? "" : path.slice(0, i);
}

/** The bare file name (last path segment). */
function fileNameOf(path: string): string {
  const i = path.lastIndexOf("/");
  return i === -1 ? path : path.slice(i + 1);
}

/** Append a cache-busting query so a freshly replaced asset is re-fetched
 *  instead of served stale from the browser/CDN cache. */
function withVersion(url: string, version: number | null): string {
  if (!version) return url;
  return url.includes("?") ? `${url}&v=${version}` : `${url}?v=${version}`;
}

function MediaPreview({
  item,
  version,
}: {
  item: MediaItem;
  version: number | null;
}) {
  if (item.url && isVideo(item.name)) {
    return (
      <video
        key={version ?? "v0"}
        controls
        preload="metadata"
        src={withVersion(item.url, version)}
        className="h-full w-full bg-obsidian object-contain"
      />
    );
  }
  if (item.url && isImage(item.name)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={withVersion(item.url, version)}
        alt={item.name}
        className="h-full w-full bg-obsidian object-contain"
      />
    );
  }
  const Icon = item.url ? FileIcon : ImageOff;
  return (
    <div className="flex h-full w-full items-center justify-center bg-obsidian/60 text-cream/20">
      <Icon className="h-10 w-10" />
    </div>
  );
}

function MediaTile({
  item,
  onDelete,
  onReplaced,
}: {
  item: MediaItem;
  onDelete: (item: MediaItem) => void;
  onReplaced: () => void;
}) {
  const { success, error } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [replacing, setReplacing] = useState(false);
  // Bumped after a successful replace to bust the image/video cache so the new
  // version shows immediately even though the URL is unchanged.
  const [version, setVersion] = useState<number | null>(null);

  const tone = isVideo(item.name) ? "blue" : isImage(item.name) ? "gold" : "neutral";
  const kindLabel = isVideo(item.name)
    ? "Video"
    : isImage(item.name)
      ? "Bild"
      : "Datei";
  const folder = folderOf(item.path);
  const baseName = fileNameOf(item.path);

  async function copyLink() {
    if (!item.url) {
      error("Keine öffentliche URL vorhanden.");
      return;
    }
    try {
      await navigator.clipboard.writeText(item.url);
      success("Link kopiert.");
    } catch {
      error("Kopieren fehlgeschlagen.");
    }
  }

  async function handleFileChosen(file: File) {
    setReplacing(true);
    try {
      const fd = new FormData();
      fd.set("path", item.path);
      fd.set("file", file);
      const res = await replaceMediaObject(fd);
      if (res.ok) {
        setVersion(Date.now());
        success("Datei ersetzt.");
        onReplaced();
      } else {
        error(res.error ?? "Ersetzen fehlgeschlagen.");
      }
    } catch {
      error("Ersetzen fehlgeschlagen.");
    } finally {
      setReplacing(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-panel/40 transition-colors hover:border-gold-300/30">
      <div className="relative aspect-video w-full overflow-hidden border-b border-white/5">
        <MediaPreview item={item} version={version} />

        <div className="pointer-events-none absolute left-2 top-2">
          <AdminBadge tone={tone}>{kindLabel}</AdminBadge>
        </div>

        {/* Hover action bar */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-end gap-1.5 bg-gradient-to-t from-obsidian/90 via-obsidian/60 to-transparent p-2 opacity-0 transition-opacity duration-200 group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100">
          <AdminButton
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            loading={replacing}
            onClick={() => inputRef.current?.click()}
          >
            Ersetzen
          </AdminButton>
          <AdminButton
            variant="ghost"
            size="sm"
            icon={Link2}
            onClick={copyLink}
          >
            Link kopieren
          </AdminButton>
          <AdminButton
            variant="ghost"
            size="sm"
            icon={Trash2}
            onClick={() => onDelete(item)}
          >
            Löschen
          </AdminButton>
        </div>

        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileChosen(file);
          }}
        />

        {replacing && (
          <div className="absolute inset-0 flex items-center justify-center bg-obsidian/70 backdrop-blur-[1px]">
            <RefreshCw className="h-6 w-6 animate-spin text-gold-300" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0">
          {folder && (
            <p
              className="flex items-center gap-1 truncate text-[11px] text-cream/30"
              title={folder}
            >
              <Folder className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{folder}</span>
            </p>
          )}
          <p
            className="truncate text-sm font-medium text-cream/90"
            title={item.path}
          >
            {baseName}
          </p>
          <p className="mt-0.5 text-xs text-cream/40">
            {formatBytes(item.size)} · {formatDate(item.createdAt)}
          </p>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-1.5">
          <AdminButton
            variant="secondary"
            size="sm"
            icon={Link2}
            onClick={copyLink}
          >
            Link kopieren
          </AdminButton>
          <AdminButton
            variant="ghost"
            size="sm"
            icon={Code2}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(item.ref);
                success("Ref kopiert.");
              } catch {
                error("Kopieren fehlgeschlagen.");
              }
            }}
          >
            Ref kopieren
          </AdminButton>
        </div>
      </div>
    </div>
  );
}

export function MediaGrid({ items }: { items: MediaItem[] }) {
  const router = useRouter();
  const { success, error } = useToast();
  const [pending, startTransition] = useTransition();
  const [toDelete, setToDelete] = useState<MediaItem | null>(null);

  function handleDelete() {
    if (!toDelete) return;
    const path = toDelete.path;
    startTransition(async () => {
      const res = await deleteMediaObject(path);
      if (res.ok) {
        success("Datei gelöscht.");
        setToDelete(null);
        router.refresh();
      } else {
        error(res.error ?? "Löschen fehlgeschlagen.");
      }
    });
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-panel/40">
        <EmptyState
          icon={ImageOff}
          title="Keine Medien"
          description="Lade oben eine Datei hoch, um zu beginnen."
        />
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <MediaTile
            key={item.path}
            item={item}
            onDelete={setToDelete}
            onReplaced={() => router.refresh()}
          />
        ))}
      </div>

      <Modal
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        title="Datei löschen?"
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
          Die Datei{" "}
          <span className="font-bold text-cream">{toDelete?.name}</span> wird dauerhaft aus
          der Mediathek entfernt. Verweise auf der Website funktionieren danach nicht mehr.
        </p>
      </Modal>
    </>
  );
}
