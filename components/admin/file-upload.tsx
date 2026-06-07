"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, FileVideo, FileText, CheckCircle2, X, Loader2 } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export type UploadedFile = {
  ref: string;
  name: string;
  size: number;
  contentType: string;
};

type Status = "idle" | "uploading" | "done" | "error";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

export function FileUpload({
  bucket,
  prefix,
  accept,
  kind = "file",
  label,
  hint,
  onUploaded,
}: {
  bucket: "media" | "course-content";
  prefix: string;
  accept?: string;
  kind?: "video" | "pdf" | "image" | "file";
  label?: string;
  hint?: string;
  onUploaded: (file: UploadedFile) => void;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [dragging, setDragging] = useState(false);
  const [current, setCurrent] = useState<{ name: string; size: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const Icon = kind === "video" ? FileVideo : kind === "pdf" ? FileText : UploadCloud;

  const upload = useCallback(
    async (file: File) => {
      setError(null);
      setCurrent({ name: file.name, size: file.size });
      setStatus("uploading");

      try {
        const res = await fetch("/api/admin/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bucket, prefix, filename: file.name }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Konnte Upload nicht starten");
        }
        const { token, path, ref } = (await res.json()) as {
          token: string;
          path: string;
          ref: string;
        };

        const supabase = getSupabaseBrowserClient();
        if (!supabase) throw new Error("Supabase nicht konfiguriert");

        const { error: upErr } = await supabase.storage
          .from(bucket)
          .uploadToSignedUrl(path, token, file, {
            contentType: file.type || undefined,
            upsert: true,
          });
        if (upErr) throw new Error(upErr.message);

        setStatus("done");
        onUploaded({
          ref,
          name: file.name,
          size: file.size,
          contentType: file.type || "application/octet-stream",
        });
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Upload fehlgeschlagen");
      }
    },
    [bucket, prefix, onUploaded]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) upload(file);
    },
    [upload]
  );

  function reset() {
    setStatus("idle");
    setCurrent(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      {label && <span className="tac-label mb-2 block">{label}</span>}

      {status === "uploading" || status === "done" ? (
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl border px-4 py-3",
            status === "done"
              ? "border-emerald-500/30 bg-emerald-500/[0.04]"
              : "border-gold-300/30 bg-gold-300/[0.03]"
          )}
        >
          {status === "uploading" ? (
            <Loader2 className="h-5 w-5 flex-shrink-0 animate-spin text-gold-300" />
          ) : (
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-400" />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-cream/90">{current?.name}</p>
            <p className="text-xs text-cream/40">
              {current ? formatBytes(current.size) : ""}
              {status === "uploading" ? " · wird hochgeladen…" : " · fertig"}
            </p>
            {status === "uploading" && (
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-1/3 animate-[shimmer_1.4s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-transparent via-gold-300 to-transparent" />
              </div>
            )}
          </div>
          {status === "done" && (
            <button
              onClick={reset}
              className="flex-shrink-0 text-cream/30 transition-colors hover:text-cream/70"
              aria-label="Anderen Datei wählen"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      ) : (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-8 text-center transition-colors",
            dragging
              ? "border-gold-300/60 bg-gold-300/[0.05]"
              : "border-white/15 bg-white/[0.01] hover:border-gold-300/30 hover:bg-white/[0.02]"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) upload(file);
            }}
          />
          <Icon className="h-7 w-7 text-gold-300/50" />
          <span className="text-sm font-medium text-cream/70">
            Datei hierher ziehen oder <span className="text-gold-300">auswählen</span>
          </span>
          {hint && <span className="text-xs text-cream/30">{hint}</span>}
        </label>
      )}

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
