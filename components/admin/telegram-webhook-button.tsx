"use client";

import { useState } from "react";
import { Loader2, Webhook, Check, AlertTriangle } from "lucide-react";
import { registerTelegramWebhook } from "@/app/admin/telegram/actions";

export function TelegramWebhookButton() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function run() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await registerTelegramWebhook();
      setMsg({ ok: res.ok, text: res.ok ? res.info ?? "Webhook gesetzt." : res.error ?? "Fehlgeschlagen." });
    } catch {
      setMsg({ ok: false, text: "Aktion fehlgeschlagen." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-3">
      <button
        type="button"
        onClick={run}
        disabled={loading}
        className="inline-flex w-fit items-center gap-2.5 rounded-full bg-gold-gradient px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-obsidian transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Webhook className="h-4 w-4" />}
        Bot-Webhook registrieren
      </button>
      {msg ? (
        <p className={`flex items-center gap-2 text-sm ${msg.ok ? "text-emerald-300" : "text-red-400"}`}>
          {msg.ok ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />} {msg.text}
        </p>
      ) : null}
    </div>
  );
}
