"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

/** Read-only field that copies its value to the clipboard on click. */
export function CopyField({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard blocked — selection still works
    }
  }

  return (
    <div>
      {label && (
        <div className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-cream/40">
          {label}
        </div>
      )}
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-obsidian/60 p-2 pl-4">
        <span className="min-w-0 flex-1 truncate font-mono text-sm text-cream/80">
          {value}
        </span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-gold-300 px-3 py-2 text-xs font-bold uppercase tracking-wider text-obsidian transition hover:bg-gold-200"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Kopiert" : "Kopieren"}
        </button>
      </div>
    </div>
  );
}
