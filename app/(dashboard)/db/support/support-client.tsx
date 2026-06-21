"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus, Send, ChevronDown, ChevronUp, LifeBuoy, Clock } from "lucide-react";
import {
  createTicket,
  replyToTicket,
  getMyTickets,
  type TicketWithMessages,
} from "./actions";

/* ── Status helpers ──────────────────────────────────────────────────── */

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  open: {
    label: "Offen",
    classes: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  },
  in_progress: {
    label: "In Bearbeitung",
    classes: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  },
  resolved: {
    label: "Gelöst",
    classes: "bg-sky-500/10 text-sky-300 border-sky-500/20",
  },
  closed: {
    label: "Geschlossen",
    classes: "bg-white/5 text-cream/50 border-white/10",
  },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.open;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${cfg.classes}`}
    >
      {cfg.label}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ── Create ticket form ──────────────────────────────────────────────── */

function CreateTicketForm({
  onCreated,
  onCancel,
}: {
  onCreated: () => void;
  onCancel: () => void;
}) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await createTicket(subject, message);
      if (!result.ok) {
        setError(result.error ?? "Fehler beim Erstellen.");
        return;
      }
      setSubject("");
      setMessage("");
      onCreated();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gold-300/20 bg-panel/40 backdrop-blur-sm p-6 space-y-4"
    >
      <h3 className="text-sm font-bold uppercase tracking-wider text-cream/80">
        Neues Ticket erstellen
      </h3>

      <div>
        <label className="tac-label mb-1 block text-cream/40">Betreff</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Kurzer Betreff deines Anliegens"
          className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-cream placeholder:text-cream/30 focus:border-gold-300/40 focus:outline-none focus:ring-1 focus:ring-gold-300/20"
          disabled={isPending}
        />
      </div>

      <div>
        <label className="tac-label mb-1 block text-cream/40">Nachricht</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Beschreibe dein Anliegen so genau wie möglich..."
          rows={4}
          className="w-full resize-none rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-cream placeholder:text-cream/30 focus:border-gold-300/40 focus:outline-none focus:ring-1 focus:ring-gold-300/20"
          disabled={isPending}
        />
      </div>

      {error && (
        <p className="text-xs font-medium text-red-400">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-b from-gold-400 to-gold-500 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-obsidian transition-all hover:brightness-110 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          Absenden
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="text-xs font-bold uppercase tracking-wider text-cream/40 hover:text-cream/70 transition-colors"
        >
          Abbrechen
        </button>
      </div>
    </form>
  );
}

/* ── Reply form ──────────────────────────────────────────────────────── */

function ReplyForm({ ticketId, onSent }: { ticketId: string; onSent: () => void }) {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await replyToTicket(ticketId, content);
      if (!result.ok) {
        setError(result.error ?? "Fehler beim Senden.");
        return;
      }
      setContent("");
      onSent();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 pt-4 border-t border-white/5">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Antwort schreiben..."
        className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-cream placeholder:text-cream/30 focus:border-gold-300/40 focus:outline-none focus:ring-1 focus:ring-gold-300/20"
        disabled={isPending}
      />
      <button
        type="submit"
        disabled={isPending || !content.trim()}
        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-b from-gold-400 to-gold-500 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-obsidian transition-all hover:brightness-110 disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Send className="h-3.5 w-3.5" />
        )}
      </button>
      {error && <p className="text-xs text-red-400 self-center">{error}</p>}
    </form>
  );
}

/* ── Ticket card ─────────────────────────────────────────────────────── */

function TicketCard({
  ticket,
  onRefresh,
}: {
  ticket: TicketWithMessages;
  onRefresh: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const canReply = ticket.status !== "closed" && ticket.status !== "resolved";

  return (
    <div className="rounded-2xl border border-white/10 bg-panel/40 backdrop-blur-sm overflow-hidden transition-colors hover:border-white/15">
      {/* Header row */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 px-6 py-4 text-left"
      >
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-cream/90 truncate">{ticket.subject}</p>
          <div className="mt-1 flex items-center gap-3">
            <span className="flex items-center gap-1 text-[11px] text-cream/30">
              <Clock className="h-3 w-3" />
              {formatDate(ticket.created_at)}
            </span>
            <span className="text-[11px] text-cream/30">
              {ticket.ticket_messages.length} Nachricht{ticket.ticket_messages.length !== 1 ? "en" : ""}
            </span>
          </div>
        </div>
        <StatusBadge status={ticket.status} />
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-cream/30 flex-shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-cream/30 flex-shrink-0" />
        )}
      </button>

      {/* Message thread */}
      {expanded && (
        <div className="border-t border-white/5 px-6 py-4 space-y-4">
          {ticket.ticket_messages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-xl px-4 py-3 ${
                msg.is_admin
                  ? "bg-gold-300/5 border border-gold-300/15 ml-0 mr-8"
                  : "bg-white/[0.03] border border-white/5 ml-8 mr-0"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-cream/50">
                  {msg.is_admin ? "Support-Team" : "Du"}
                </span>
                <span className="text-[10px] text-cream/25">
                  {formatDate(msg.created_at)}
                </span>
              </div>
              <p className="text-sm text-cream/70 whitespace-pre-wrap">{msg.content}</p>
            </div>
          ))}

          {canReply && <ReplyForm ticketId={ticket.id} onSent={onRefresh} />}

          {!canReply && (
            <p className="text-xs text-cream/30 text-center py-2">
              Dieses Ticket ist {ticket.status === "resolved" ? "gelöst" : "geschlossen"}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main client component ───────────────────────────────────────────── */

export function SupportClient({
  initialTickets,
}: {
  initialTickets: TicketWithMessages[];
}) {
  const [tickets, setTickets] = useState(initialTickets);
  const [showForm, setShowForm] = useState(false);
  const [isRefreshing, startRefresh] = useTransition();

  function refresh() {
    startRefresh(async () => {
      const updated = await getMyTickets();
      setTickets(updated);
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-gold-300/30" />
            <span className="tac-label text-gold-300/60 uppercase tracking-widest text-[9px]">
              Hilfe &amp; Support
            </span>
          </div>
          <h1 className="font-heading tracking-gta leading-tight text-cream text-4xl md:text-6xl uppercase mb-4">
            MEINE <span className="text-gold-300">TICKETS.</span>
          </h1>
          <p className="max-w-2xl text-[10px] font-mono text-cream/30 uppercase tracking-[0.2em] leading-relaxed">
            Erstelle ein Support-Ticket und unser Team hilft dir schnellstmöglich weiter.
          </p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-b from-gold-400 to-gold-500 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-obsidian transition-all hover:brightness-110 self-start sm:self-auto"
          >
            <Plus className="h-3.5 w-3.5" />
            Neues Ticket erstellen
          </button>
        )}
      </div>

      {/* Create form */}
      {showForm && (
        <CreateTicketForm
          onCreated={() => {
            setShowForm(false);
            refresh();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Loading indicator during refresh */}
      {isRefreshing && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-gold-300/50" />
        </div>
      )}

      {/* Ticket list */}
      {tickets.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center rounded-2xl border border-white/10 bg-panel/40 backdrop-blur-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-cream/30">
            <LifeBuoy className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-cream/70">Noch keine Tickets</p>
            <p className="mt-1 text-xs text-cream/40">
              Wir helfen dir gerne! Erstelle ein Ticket und wir melden uns.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} onRefresh={refresh} />
          ))}
        </div>
      )}
    </div>
  );
}
