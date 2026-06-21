"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Trophy,
  MessageCircle,
  BookOpen,
  CheckCircle,
  Flame,
  Info,
  Check,
  Eye,
  EyeOff,
  Loader2,
  ChevronDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  toggleRead,
  type NotificationRow,
} from "./actions";

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

const TYPE_META: Record<string, { icon: LucideIcon; color: string; label: string }> = {
  achievement: { icon: Trophy, color: "text-amber-400", label: "Achievement" },
  comment_reply: { icon: MessageCircle, color: "text-sky-400", label: "Antwort" },
  course_update: { icon: BookOpen, color: "text-emerald-400", label: "Kurs-Update" },
  quiz_passed: { icon: CheckCircle, color: "text-green-400", label: "Quiz bestanden" },
  streak: { icon: Flame, color: "text-orange-400", label: "Streak" },
  system: { icon: Info, color: "text-gold-300", label: "System" },
};

function getMeta(type: string) {
  return TYPE_META[type] ?? TYPE_META.system;
}

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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ------------------------------------------------------------------ */
/*  Full-page notification card                                        */
/* ------------------------------------------------------------------ */

function NotificationCard({
  n,
  onToggle,
  onNavigate,
}: {
  n: NotificationRow;
  onToggle: (id: string, read: boolean) => void;
  onNavigate: (id: string, link?: string | null) => void;
}) {
  const { icon: Icon, color, label } = getMeta(n.type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative border border-white/5 bg-white/[0.01] transition-all hover:border-white/10 hover:bg-white/[0.02] ${
        n.read ? "opacity-50 hover:opacity-80" : ""
      }`}
    >
      {/* Unread accent bar */}
      {!n.read && (
        <div className="absolute left-0 top-0 h-full w-0.5 bg-gold-300 shadow-[0_0_8px_rgba(201,169,97,0.3)]" />
      )}

      <div className="flex items-start gap-4 p-5">
        {/* Icon */}
        <div
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-white/5 bg-white/[0.03] ${color}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        {/* Main content — clickable if link exists */}
        <button
          onClick={() => onNavigate(n.id, n.link)}
          className="min-w-0 flex-1 text-left"
          disabled={!n.link}
        >
          <div className="mb-1 flex items-center gap-2">
            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-cream/20">
              {label}
            </span>
            {!n.read && (
              <span className="h-1.5 w-1.5 rounded-full bg-gold-300 shadow-[0_0_4px_rgba(201,169,97,0.4)]" />
            )}
          </div>
          <p className="text-[14px] font-semibold leading-snug text-cream">
            {n.title}
          </p>
          {n.body && (
            <p className="mt-1 text-[12px] leading-relaxed text-cream/40">
              {n.body}
            </p>
          )}
          <div className="mt-2 flex items-center gap-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-cream/15">
              {relativeTime(n.created_at)}
            </span>
            <span className="text-[10px] font-mono text-cream/10">
              {formatDate(n.created_at)}
            </span>
          </div>
        </button>

        {/* Toggle read/unread */}
        <button
          onClick={() => onToggle(n.id, !n.read)}
          className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center border border-white/5 bg-white/[0.02] text-cream/20 transition-colors hover:text-gold-300 hover:border-gold-300/20"
          title={n.read ? "Als ungelesen markieren" : "Als gelesen markieren"}
        >
          {n.read ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main list component                                                */
/* ------------------------------------------------------------------ */

const PAGE_SIZE = 30;

export function NotificationList({
  initialNotifications,
  initialUnreadCount,
}: {
  initialNotifications: NotificationRow[];
  initialUnreadCount: number;
}) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [hasMore, setHasMore] = useState(initialNotifications.length >= PAGE_SIZE);
  const [isPending, startTransition] = useTransition();

  /* ---- Actions ---- */
  function handleToggle(id: string, read: boolean) {
    startTransition(async () => {
      await toggleRead(id, read);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read } : n))
      );
      setUnreadCount((c) => (read ? Math.max(0, c - 1) : c + 1));
    });
  }

  function handleNavigate(id: string, link?: string | null) {
    if (!link) return;
    startTransition(async () => {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      router.push(link);
    });
  }

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    });
  }

  function handleLoadMore() {
    startTransition(async () => {
      const result = await getNotifications(PAGE_SIZE, notifications.length);
      setNotifications((prev) => [...prev, ...result.notifications]);
      setUnreadCount(result.unreadCount);
      if (result.notifications.length < PAGE_SIZE) setHasMore(false);
    });
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-cream/20">
          {unreadCount > 0
            ? `${unreadCount} ungelesene Nachricht${unreadCount !== 1 ? "en" : ""}`
            : "Alle gelesen"}
        </p>
        <div className="flex items-center gap-3">
          {isPending && (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-gold-300/40" />
          )}
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 border border-white/5 bg-white/[0.02] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-gold-300/60 transition-colors hover:border-gold-300/20 hover:text-gold-300"
            >
              <Check className="h-3 w-3" />
              Alle als gelesen markieren
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-white/5 bg-white/[0.01] py-20 text-center">
          <Bell className="mb-4 h-12 w-12 text-cream/10" />
          <p className="text-[14px] font-semibold text-cream/30">
            Keine Benachrichtigungen
          </p>
          <p className="mt-2 text-[11px] text-cream/15">
            Sobald es Neuigkeiten gibt, erscheinen sie hier.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <NotificationCard
              key={n.id}
              n={n}
              onToggle={handleToggle}
              onNavigate={handleNavigate}
            />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && notifications.length > 0 && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={isPending}
            className="flex items-center gap-2 border border-white/5 bg-white/[0.02] px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] text-cream/40 transition-colors hover:border-gold-300/20 hover:text-gold-300 disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
            Weitere laden
          </button>
        </div>
      )}
    </div>
  );
}
