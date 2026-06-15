"use client";

import { useCallback, useRef, useState } from "react";
import * as tus from "tus-js-client";
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

// Files at/under this size take the quick signed-PUT path. Larger files (videos)
// use resumable TUS uploads — chunked, with automatic resume on a dropped
// connection — so a multi-GB upload survives network blips.
const LARGE_FILE_BYTES = 40 * 1024 * 1024;
// Supabase resumable uploads require exactly 6 MB chunks.
const TUS_CHUNK = 6 * 1024 * 1024;

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
  const [percent, setPercent] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const Icon = kind === "video" ? FileVideo : kind === "pdf" ? FileText : UploadCloud;

  /** Quick path for small files: signed upload URL + single PUT. */
  const uploadSmall = useCallback(
    async (file: File) => {
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
      return ref;
    },
    [bucket, prefix]
  );

  /** Resumable path for large files: chunked TUS upload with the admin's JWT. */
  const uploadLarge = useCallback(
    async (file: File) => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl) throw new Error("Supabase nicht konfiguriert");

      const supabase = getSupabaseBrowserClient();
      if (!supabase) throw new Error("Supabase nicht konfiguriert");
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) throw new Error("Nicht angemeldet — bitte neu einloggen.");

      // Server computes a per-course destination path (no signed reservation).
      const res = await fetch("/api/admin/upload-target", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bucket, prefix, filename: file.name }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Konnte Upload nicht starten");
      }
      const { path, ref } = (await res.json()) as { path: string; ref: string };

      await new Promise<void>((resolve, reject) => {
        const upload = new tus.Upload(file, {
          endpoint: `${supabaseUrl}/storage/v1/upload/resumable`,
          retryDelays: [0, 3000, 5000, 10000, 20000],
          headers: {
            authorization: `Bearer ${accessToken}`,
            "x-upsert": "true",
          },
          uploadDataDuringCreation: true,
          removeFingerprintOnSuccess: true,
          chunkSize: TUS_CHUNK,
          metadata: {
            bucketName: bucket,
            objectName: path,
            contentType: file.type || "application/octet-stream",
            cacheControl: "3600",
          },
          onError: (err) => reject(err),
          onProgress: (sent, total) => {
            setPercent(total > 0 ? Math.round((sent / total) * 100) : 0);
          },
          onSuccess: () => resolve(),
        });

        upload.findPreviousUploads().then((previous) => {
          if (previous.length > 0) upload.resumeFromPreviousUpload(previous[0]);
          upload.start();
        });
      });

      return ref;
    },
    [bucket, prefix]
  );

  const upload = useCallback(
    async (file: File) => {
      setError(null);
      setCurrent({ name: file.name, size: file.size });
      setPercent(file.size > LARGE_FILE_BYTES ? 0 : null);
      setStatus("uploading");

      try {
        const ref =
          file.size > LARGE_FILE_BYTES ? await uploadLarge(file) : await uploadSmall(file);
        setStatus("done");
        setPercent(null);
        onUploaded({
          ref,
          name: file.name,
          size: file.size,
          contentType: file.type || "application/octet-stream",
        });
      } catch (err) {
        setStatus("error");
        setPercent(null);
        setError(err instanceof Error ? err.message : "Upload fehlgeschlagen");
      }
    },
    [uploadLarge, uploadSmall, onUploaded]
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
    setPercent(null);
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
              {status === "uploading"
                ? percent !== null
                  ? ` · ${percent}% hochgeladen`
                  : " · wird hochgeladen…"
                : " · fertig"}
            </p>
            {status === "uploading" && (
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
                {percent !== null ? (
                  <div
                    className="h-full rounded-full bg-gold-300 transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                ) : (
                  <div className="h-full w-1/3 animate-[shimmer_1.4s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-transparent via-gold-300 to-transparent" />
                )}
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
