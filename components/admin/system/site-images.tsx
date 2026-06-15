"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImageOff, RotateCcw, Upload } from "lucide-react";
import { AdminButton } from "@/components/admin/admin-button";
import { useToast } from "@/components/admin/toast";
import { setSiteImage, resetSiteImage } from "@/app/admin/medien/actions";

export type SiteImageSlotView = {
  key: string;
  label: string;
  defaultSrc: string;
  /** Current effective URL (override or default). */
  url: string;
};

function SlotCard({ slot }: { slot: SiteImageSlotView }) {
  const router = useRouter();
  const { success, error } = useToast();
  const [pending, startTransition] = useTransition();
  const [action, setAction] = useState<"upload" | "reset" | null>(null);
  const [broken, setBroken] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isOverridden = slot.url !== slot.defaultSrc;

  function handleFile(file: File) {
    setBroken(false);
    setAction("upload");
    const fd = new FormData();
    fd.set("key", slot.key);
    fd.set("file", file);
    startTransition(async () => {
      const res = await setSiteImage(fd);
      setAction(null);
      if (res.ok) {
        success("Bild aktualisiert.");
        router.refresh();
      } else {
        error(res.error ?? "Aktualisierung fehlgeschlagen.");
      }
      if (inputRef.current) inputRef.current.value = "";
    });
  }

  function handleReset() {
    setBroken(false);
    setAction("reset");
    startTransition(async () => {
      const res = await resetSiteImage(slot.key);
      setAction(null);
      if (res.ok) {
        success("Auf Original zurückgesetzt.");
        router.refresh();
      } else {
        error(res.error ?? "Zurücksetzen fehlgeschlagen.");
      }
    });
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-panel/40">
      <div className="relative aspect-[4/3] w-full bg-white/[0.02]">
        {slot.url && !broken ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={slot.url}
            alt={slot.label}
            className="h-full w-full object-cover object-center"
            onError={() => setBroken(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-cream/25">
            <ImageOff className="h-7 w-7" />
          </div>
        )}
        <div className="absolute left-2 top-2">
          <span
            className={
              isOverridden
                ? "inline-flex items-center rounded-full border border-gold-300/30 bg-gold-300/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gold-100"
                : "inline-flex items-center rounded-full border border-white/10 bg-ink/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-cream/50"
            }
          >
            {isOverridden ? "Ersetzt" : "Original"}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <p className="text-xs font-semibold text-cream/80">{slot.label}</p>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />

        <div className="flex flex-wrap items-center gap-2">
          <AdminButton
            size="sm"
            variant="secondary"
            icon={Upload}
            loading={pending && action === "upload"}
            disabled={pending}
            onClick={() => inputRef.current?.click()}
          >
            Ersetzen
          </AdminButton>
          <AdminButton
            size="sm"
            variant="ghost"
            icon={RotateCcw}
            loading={pending && action === "reset"}
            disabled={pending || !isOverridden}
            onClick={handleReset}
          >
            Zurücksetzen
          </AdminButton>
        </div>
      </div>
    </div>
  );
}

export function SiteImages({ slots }: { slots: SiteImageSlotView[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {slots.map((slot) => (
        <SlotCard key={slot.key} slot={slot} />
      ))}
    </div>
  );
}
