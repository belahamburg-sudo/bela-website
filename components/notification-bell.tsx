"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, Trophy, MessageCircle, BookOpen, CheckCircle, Flame, Info, Check, Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  type NotificationRow,
} from "@/app/(dashboard)/db/benachrichtigungen/actions";

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

const TYPE_META: Record<string, { icon: LucideIcon; color: string }> = {
  achievement: { icon: Trophy, color: "text-amber-400" },
  comment_reply: { icon: MessageCircle, color: "text-sky-400" },
  course_update: { icon: BookOpen, color: "text-emerald-400" },
  quiz_passed: { icon: CheckCircle, color: "text-green-400" },
  streak: { icon: Flame, color: "text-orange-400" },
  system: { icon: Info, color: "text-gold-300" },
};

function getMeta(type: string) {
  return TYPE_META[type] ?? TYPE_META.system;
}

/** German relative time without external deps. */
function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "gerade eben";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `vor ${minutes} Min.`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `vor ${hours} Std.`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `vor ${days} ${days === 1 ? "Tag" : "Tagen"}`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `vor ${weeks} ${weeks === 1 ? "Woche" : "Wochen"}`;
  const months = Math.floor(days / 30);
  if (months < 12) return `vor ${months} ${months === 1 ? "Monat" : "Monaten"}`;
  return `vor ${Math.floor(months / 12)} Jahr(en)`;
}

/* ------------------------------------------------------------------ */
/*  Notification item                                                  */
/* ------------------------------------------------------------------ */

function NotificationItem({
  n,
  onRead,
}: {
  n: NotificationRow;
  onRead: (id: string, link?: string | null) => void;
}) {
  const { icon: Icon, color } = getMeta(n.type);

  return (
    <button
      onClick={() => onRead(n.id, n.link)}
      className={`group flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.03] ${
        n.read ? "opacity-50" : ""
      }`}
    >
      {/* Icon */}
      <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-white/5 bg-white/[0.03] ${color}`}>
        <Icon className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-cream leading-snug truncate">
          {n.title}
        </p>
        {n.body && (
          <p className="mt-0.5 text-[11px] text-cream/40 leading-relaxed line-clamp-2">
            {n.body}
          </p>
        )}
        <p className="mt-1 text-[10px] font-mono text-cream/20 uppercase tracking-wider">
          {relativeTime(n.created_at)}
        </p>
      </div>

      {/* Unread dot */}
      {!n.read && (
        <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-gold-300 shadow-[0_0_6px_rgba(201,169,97,0.5)]" />
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Bell + dropdown                                                    */
/* ------------------------------------------------------------------ */

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  /* ---- Data fetching ---- */
  const refresh = useCallback(() => {
    startTransition(async () => {
      const result = await getNotifications(20, 0);
      setNotifications(result.notifications);
      setUnreadCount(result.unreadCount);
    });
  }, []);

  // Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Refresh on window focus
  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener("focus", handler);
    return () => window.removeEventListener("focus", handler);
  }, [refresh]);

  /* ---- Outside click ---- */
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  /* ---- Actions ---- */
  function handleReadAndNavigate(id: string, link?: string | null) {
    startTransition(async () => {
      await markAsRead(id);
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      setOpen(false);
      if (link) router.push(link);
    });
  }

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    });
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center border border-white/5 bg-white/[0.03] text-cream/40 transition-colors hover:text-gold-300 hover:border-gold-300/20 hover:bg-gold-300/[0.02]"
        aria-label={`Benachrichtigungen${unreadCount > 0 ? ` (${unreadCount} ungelesen)` : ""}`}
      >
        <Bell className="h-4 w-4" />

        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gold-300 px-1 text-[9px] font-bold text-obsidian shadow-[0_0_8px_rgba(201,169,97,0.4)]">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden border border-white/10 bg-ink/95 shadow-soft backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-cream/60">
                Benachrichtigungen
              </h3>
              <div className="flex items-center gap-2">
                {isPending && (
                  <Loader2 className="h-3 w-3 animate-spin text-gold-300/40" />
                )}
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 text-[10px] font-semibold text-gold-300/60 uppercase tracking-wider transition-colors hover:text-gold-300"
                  >
                    <Check className="h-3 w-3" />
                    Alle gelesen
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto overscroll-contain">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="mb-3 h-8 w-8 text-cream/10" />
                  <p className="text-[12px] font-semibold text-cream/30">
                    Keine neuen Benachrichtigungen
                  </p>
                  <p className="mt-1 text-[10px] text-cream/15">
                    Du bist auf dem neuesten Stand.
                  </p>
                </div>
              ) : (
                <>
                  {notifications.map((n) => (
                    <NotificationItem
                      key={n.id}
                      n={n}
                      onRead={handleReadAndNavigate}
                    />
                  ))}

                  {/* Link to full page */}
                  <div className="border-t border-white/5 p-2">
                    <button
                      onClick={() => {
                        setOpen(false);
                        router.push("/benachrichtigungen");
                      }}
                      className="flex w-full items-center justify-center py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-gold-300/50 transition-colors hover:text-gold-300"
                    >
                      Alle anzeigen
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
