"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Link2, Code2, Trash2, FileIcon, ImageOff } from "lucide-react";
import { AdminBadge, EmptyState } from "@/components/admin/ui";
import { AdminButton } from "@/components/admin/admin-button";
import { Modal } from "@/components/admin/modal";
import { useToast } from "@/components/admin/toast";
import { deleteMediaObject } from "@/app/admin/medien/actions";

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

function MediaPreview({ item }: { item: MediaItem }) {
  if (item.url && isVideo(item.name)) {
    return (
      <video
        controls
        preload="metadata"
        src={item.url}
        className="h-full w-full bg-obsidian object-contain"
      />
    );
  }
  if (item.url && isImage(item.name)) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={item.url}
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

export function MediaGrid({ items }: { items: MediaItem[] }) {
  const router = useRouter();
  const { success, error } = useToast();
  const [pending, startTransition] = useTransition();
  const [toDelete, setToDelete] = useState<MediaItem | null>(null);

  async function copy(text: string | null, label: string) {
    if (!text) {
      error("Kein Wert zum Kopieren vorhanden.");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      success(`${label} kopiert.`);
    } catch {
      error("Kopieren fehlgeschlagen.");
    }
  }

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
        {items.map((item) => {
          const tone = isVideo(item.name)
            ? "blue"
            : isImage(item.name)
              ? "gold"
              : "neutral";
          const kindLabel = isVideo(item.name)
            ? "Video"
            : isImage(item.name)
              ? "Bild"
              : "Datei";
          return (
            <div
              key={item.path}
              className="flex flex-col overflow-hidden rounded-xl border border-white/10 bg-panel/40"
            >
              <div className="relative aspect-video w-full overflow-hidden border-b border-white/5">
                <MediaPreview item={item} />
                <div className="pointer-events-none absolute left-2 top-2">
                  <AdminBadge tone={tone}>{kindLabel}</AdminBadge>
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-cream/90" title={item.name}>
                    {item.name}
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
                    onClick={() => copy(item.url, "URL")}
                  >
                    URL kopieren
                  </AdminButton>
                  <AdminButton
                    variant="ghost"
                    size="sm"
                    icon={Code2}
                    onClick={() => copy(item.ref, "Ref")}
                  >
                    Ref kopieren
                  </AdminButton>
                  <AdminButton
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    onClick={() => setToDelete(item)}
                  >
                    Löschen
                  </AdminButton>
                </div>
              </div>
            </div>
          );
        })}
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
