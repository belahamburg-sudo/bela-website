"use client";

import { useState, useTransition } from "react";
import { Pin, Trash2, MessageSquare, Reply, Shield, Filter } from "lucide-react";
import { AdminBadge } from "@/components/admin/ui";
import { DataTable, type Column } from "@/components/admin/data-table";
import { useToast } from "@/components/admin/toast";
import { adminPinComment, adminDeleteComment } from "./actions";
import type { ModerationComment } from "./page";

function relativeDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "gerade eben";
  if (diffMins < 60) return `vor ${diffMins} Min.`;
  const hrs = Math.floor(diffMins / 60);
  if (hrs < 24) return `vor ${hrs} Std.`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `vor ${days} ${days === 1 ? "Tag" : "Tagen"}`;

  return d.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function CommentModerationTable({
  comments,
  courseOptions,
}: {
  comments: ModerationComment[];
  courseOptions: { slug: string; title: string }[];
}) {
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const { success, error: showError } = useToast();
  const [isPending, startTransition] = useTransition();
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [pinnedIds, setPinnedIds] = useState<Map<string, boolean>>(
    new Map(comments.filter((c) => c.isPinned).map((c) => [c.id, true]))
  );

  const filtered = comments
    .filter((c) => !deletedIds.has(c.id))
    .filter((c) => courseFilter === "all" || c.courseSlug === courseFilter);

  function handlePin(commentId: string, pin: boolean) {
    startTransition(async () => {
      const result = await adminPinComment(commentId, pin);
      if (result.ok) {
        setPinnedIds((prev) => {
          const next = new Map(prev);
          if (pin) next.set(commentId, true);
          else next.delete(commentId);
          return next;
        });
        success(pin ? "Kommentar angepinnt." : "Kommentar losgelöst.");
      } else {
        showError(result.error ?? "Fehler beim Anpinnen.");
      }
    });
  }

  function handleDelete(commentId: string) {
    startTransition(async () => {
      const result = await adminDeleteComment(commentId);
      if (result.ok) {
        setDeletedIds((prev) => new Set(prev).add(commentId));
        success("Kommentar gelöscht.");
      } else {
        showError(result.error ?? "Fehler beim Löschen.");
      }
    });
  }

  const columns: Column<ModerationComment>[] = [
    {
      key: "author",
      header: "Autor",
      render: (row) => (
        <div className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold uppercase ${
              row.isAdmin
                ? "bg-gold-300/15 text-gold-300 border border-gold-300/30"
                : "bg-white/[0.06] text-cream/50 border border-white/10"
            }`}
          >
            {row.authorName.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm font-medium text-cream/90">
                {row.authorName}
              </span>
              {row.isAdmin && (
                <AdminBadge tone="gold">
                  <Shield className="h-2.5 w-2.5" />
                  Admin
                </AdminBadge>
              )}
            </div>
            {row.authorEmail && (
              <span className="block truncate text-[11px] text-cream/35">
                {row.authorEmail}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "content",
      header: "Kommentar",
      render: (row) => (
        <div className="max-w-sm">
          <div className="flex items-center gap-1.5 mb-1">
            {row.isReply && (
              <Reply className="h-3 w-3 flex-shrink-0 text-cream/30" />
            )}
            {pinnedIds.has(row.id) && (
              <AdminBadge tone="gold">
                <Pin className="h-2.5 w-2.5" />
                Angepinnt
              </AdminBadge>
            )}
          </div>
          <p className="line-clamp-2 text-sm text-cream/65">{row.content}</p>
        </div>
      ),
    },
    {
      key: "lesson",
      header: "Lektion",
      render: (row) => (
        <div className="min-w-0 max-w-[200px]">
          <span className="block truncate text-sm text-cream/70">
            {row.lessonTitle}
          </span>
          <span className="block truncate text-[11px] text-cream/35">
            {row.courseTitle}
          </span>
        </div>
      ),
    },
    {
      key: "date",
      header: "Datum",
      render: (row) => (
        <span className="whitespace-nowrap text-xs text-cream/45">
          {relativeDate(row.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            disabled={isPending}
            onClick={() => handlePin(row.id, !pinnedIds.has(row.id))}
            title={pinnedIds.has(row.id) ? "Loslösen" : "Anpinnen"}
            className={`rounded-lg p-2 transition-colors ${
              pinnedIds.has(row.id)
                ? "text-gold-300 hover:bg-gold-300/10"
                : "text-cream/30 hover:text-gold-300 hover:bg-white/[0.04]"
            } disabled:opacity-40`}
          >
            <Pin className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleDelete(row.id)}
            title="Löschen"
            className="rounded-lg p-2 text-cream/30 transition-colors hover:text-red-400 hover:bg-red-400/10 disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Course filter */}
      {courseOptions.length > 1 && (
        <div className="flex items-center gap-2 border-b border-white/5 px-5 py-3">
          <Filter className="h-3.5 w-3.5 text-cream/30" />
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="rounded-lg border border-white/10 bg-transparent px-3 py-1.5 text-xs text-cream/70 focus:border-gold-300/40 focus:outline-none"
          >
            <option value="all">Alle Kurse</option>
            {courseOptions.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.title}
              </option>
            ))}
          </select>
          <span className="text-[10px] text-cream/30">
            {filtered.length} {filtered.length === 1 ? "Kommentar" : "Kommentare"}
          </span>
        </div>
      )}

      <DataTable
        columns={columns}
        rows={filtered}
        getRowKey={(row) => row.id}
        emptyIcon={MessageSquare}
        emptyTitle="Keine Kommentare"
        emptyDescription="Es gibt noch keine Kommentare in dieser Kategorie."
      />
    </div>
  );
}
