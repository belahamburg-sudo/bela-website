"use client";

import { useState, useTransition } from "react";
import {
  LifeBuoy,
  Inbox,
  Send,
  Loader2,
  Clock,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Circle,
  X,
} from "lucide-react";
import { AdminBadge } from "@/components/admin/ui";
import {
  adminReply,
  updateTicketStatus,
  updateTicketPriority,
  getAllTickets,
  type TicketWithMessages,
} from "./actions";

/* ── Config maps ─────────────────────────────────────────────────────── */

const STATUS_TONE: Record<string, "green" | "amber" | "blue" | "neutral"> = {
  open: "green",
  in_progress: "amber",
  resolved: "blue",
  closed: "neutral",
};
const STATUS_LABEL: Record<string, string> = {
  open: "Offen",
  in_progress: "In Bearbeitung",
  resolved: "Gelöst",
  closed: "Geschlossen",
};

const PRIORITY_TONE: Record<string, "neutral" | "blue" | "amber" | "red"> = {
  low: "neutral",
  normal: "blue",
  high: "amber",
  urgent: "red",
};
const PRIORITY_LABEL: Record<string, string> = {
  low: "Niedrig",
  normal: "Normal",
  high: "Hoch",
  urgent: "Dringend",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ── Ticket detail drawer ────────────────────────────────────────────── */

function TicketDetail({
  ticket,
  onClose,
  onRefresh,
}: {
  ticket: TicketWithMessages;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [replyContent, setReplyContent] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyContent.trim()) return;
    startTransition(async () => {
      const result = await adminReply(ticket.id, replyContent);
      if (result.ok) {
        setReplyContent("");
        onRefresh();
      }
    });
  }

  function handleStatusChange(status: string) {
    startTransition(async () => {
      await updateTicketStatus(ticket.id, status);
      onRefresh();
    });
  }

  function handlePriorityChange(priority: string) {
    startTransition(async () => {
      await updateTicketPriority(ticket.id, priority);
      onRefresh();
    });
  }

  return (
    <div className="rounded-xl border border-white/10 bg-panel/40 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-white/5 px-5 py-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-cream/90">{ticket.subject}</h3>
          <p className="mt-1 text-xs text-cream/40">{ticket.email ?? "Unbekannt"}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 text-cream/30 hover:text-cream/70 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 border-b border-white/5 px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-cream/30">
            Status:
          </span>
          <select
            value={ticket.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={isPending}
            className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-cream focus:border-gold-300/40 focus:outline-none"
          >
            <option value="open">Offen</option>
            <option value="in_progress">In Bearbeitung</option>
            <option value="resolved">Gelöst</option>
            <option value="closed">Geschlossen</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-cream/30">
            Priorität:
          </span>
          <select
            value={ticket.priority}
            onChange={(e) => handlePriorityChange(e.target.value)}
            disabled={isPending}
            className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-cream focus:border-gold-300/40 focus:outline-none"
          >
            <option value="low">Niedrig</option>
            <option value="normal">Normal</option>
            <option value="high">Hoch</option>
            <option value="urgent">Dringend</option>
          </select>
        </div>
      </div>

      {/* Messages */}
      <div className="max-h-[400px] overflow-y-auto px-5 py-4 space-y-3">
        {ticket.ticket_messages.map((msg) => (
          <div
            key={msg.id}
            className={`rounded-xl px-4 py-3 ${
              msg.is_admin
                ? "bg-gold-300/5 border border-gold-300/15 mr-12"
                : "bg-white/[0.03] border border-white/5 ml-12"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cream/50">
                {msg.is_admin ? "Admin" : "Mitglied"}
              </span>
              <span className="text-[10px] text-cream/25">
                {formatDate(msg.created_at)}
              </span>
            </div>
            <p className="text-sm text-cream/70 whitespace-pre-wrap">{msg.content}</p>
          </div>
        ))}
      </div>

      {/* Reply form */}
      <form
        onSubmit={handleReply}
        className="flex gap-3 border-t border-white/5 px-5 py-4"
      >
        <input
          type="text"
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          placeholder="Als Admin antworten..."
          className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-cream placeholder:text-cream/30 focus:border-gold-300/40 focus:outline-none focus:ring-1 focus:ring-gold-300/20"
          disabled={isPending}
        />
        <button
          type="submit"
          disabled={isPending || !replyContent.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-b from-gold-400 to-gold-500 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-obsidian transition-all hover:brightness-110 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          Senden
        </button>
      </form>
    </div>
  );
}

/* ── Main admin client component ─────────────────────────────────────── */

export function SupportAdminClient({
  initialTickets,
}: {
  initialTickets: TicketWithMessages[];
}) {
  const [tickets, setTickets] = useState(initialTickets);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isRefreshing, startRefresh] = useTransition();

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) ?? null;

  const openCount = tickets.filter((t) => t.status === "open").length;
  const inProgressCount = tickets.filter((t) => t.status === "in_progress").length;
  const resolvedCount = tickets.filter((t) => t.status === "resolved").length;
  const totalCount = tickets.length;

  function refresh() {
    startRefresh(async () => {
      const updated = await getAllTickets(statusFilter !== "all" ? statusFilter : undefined);
      setTickets(updated);
    });
  }

  function handleFilterChange(filter: string) {
    setStatusFilter(filter);
    startRefresh(async () => {
      const updated = await getAllTickets(filter !== "all" ? filter : undefined);
      setTickets(updated);
      setSelectedTicketId(null);
    });
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Offen", value: openCount, icon: Circle, color: "text-emerald-400" },
          { label: "In Bearbeitung", value: inProgressCount, icon: Clock, color: "text-amber-400" },
          { label: "Gelöst", value: resolvedCount, icon: CheckCircle2, color: "text-sky-400" },
          { label: "Gesamt", value: totalCount, icon: MessageSquare, color: "text-cream/60" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="group relative overflow-hidden rounded-xl border border-white/10 bg-panel/40 p-5 transition-colors hover:border-gold-300/30"
          >
            <div className="flex items-start justify-between">
              <span className="tac-label">{stat.label}</span>
              <stat.icon className={`h-4 w-4 ${stat.color} opacity-40`} />
            </div>
            <div className="mt-3 text-3xl font-extrabold tracking-tight text-cream">
              {stat.value}
            </div>
            <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gold-300/[0.03] blur-2xl transition-opacity group-hover:bg-gold-300/[0.06]" />
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {["all", "open", "in_progress", "resolved", "closed"].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => handleFilterChange(f)}
            className={`rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all ${
              statusFilter === f
                ? "bg-gold-300/10 text-gold-300 border border-gold-300/30"
                : "text-cream/40 border border-white/5 hover:text-cream/70 hover:border-white/15"
            }`}
          >
            {f === "all" ? "Alle" : STATUS_LABEL[f] ?? f}
          </button>
        ))}
        {isRefreshing && <Loader2 className="h-4 w-4 animate-spin text-gold-300/50 ml-2" />}
      </div>

      {/* Content area: table + detail */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Ticket list */}
        <div className="rounded-xl border border-white/10 bg-panel/40 backdrop-blur-sm">
          <header className="flex items-center justify-between gap-4 border-b border-white/5 px-5 py-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-cream/80">
              Tickets
            </h2>
            <span className="text-xs text-cream/30">
              {tickets.length} Einträge
            </span>
          </header>

          {tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-cream/30">
                <Inbox className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-cream/70">Keine Tickets</p>
                <p className="mt-1 text-xs text-cream/40">
                  Aktuell gibt es keine Tickets mit diesem Filter.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  type="button"
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={`w-full flex items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-white/[0.02] ${
                    selectedTicketId === ticket.id
                      ? "bg-gold-300/[0.04] border-l-2 border-l-gold-300"
                      : ""
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-cream/80 truncate">
                      {ticket.subject}
                    </p>
                    <div className="mt-1 flex items-center gap-3 flex-wrap">
                      <span className="text-[11px] text-cream/30 truncate max-w-[180px]">
                        {ticket.email ?? "Unbekannt"}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-cream/25">
                        <MessageSquare className="h-3 w-3" />
                        {ticket.ticket_messages.length}
                      </span>
                      <span className="text-[11px] text-cream/25">
                        {formatDate(ticket.updated_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <AdminBadge tone={STATUS_TONE[ticket.status] ?? "neutral"}>
                      {STATUS_LABEL[ticket.status] ?? ticket.status}
                    </AdminBadge>
                    <AdminBadge tone={PRIORITY_TONE[ticket.priority] ?? "neutral"}>
                      {PRIORITY_LABEL[ticket.priority] ?? ticket.priority}
                    </AdminBadge>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail pane */}
        <div>
          {selectedTicket ? (
            <TicketDetail
              key={selectedTicket.id + selectedTicket.updated_at}
              ticket={selectedTicket}
              onClose={() => setSelectedTicketId(null)}
              onRefresh={refresh}
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/10 px-6 py-20 text-center">
              <LifeBuoy className="h-8 w-8 text-cream/15" />
              <p className="text-sm text-cream/30">
                Wähle ein Ticket aus der Liste, um die Details anzuzeigen.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
