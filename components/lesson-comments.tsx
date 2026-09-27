"use client";

import {
  useCallback,
  useEffect,
  useOptimistic,
  useState,
  useTransition,
  useRef,
} from "react";
import {
  MessageSquare,
  Pin,
  Reply,
  Loader2,
  Trash2,
  Shield,
  Send,
} from "lucide-react";
import {
  getComments,
  addComment,
  deleteComment,
  pinComment,
  type Comment,
} from "@/app/(dashboard)/db/kurse/[slug]/comment-actions";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "gerade eben";
  if (mins < 60) return `vor ${mins} Min.`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `vor ${hrs} Std.`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `vor ${days} ${days === 1 ? "Tag" : "Tagen"}`;
  const months = Math.floor(days / 30);
  return `vor ${months} ${months === 1 ? "Monat" : "Monaten"}`;
}

function avatarInitial(name: string | null, email: string | null): string {
  if (name) return name.charAt(0).toUpperCase();
  if (email) return email.charAt(0).toUpperCase();
  return "?";
}

function displayName(author: Comment["author"]): string {
  return author.full_name?.trim() || author.email?.split("@")[0] || "Mitglied";
}

// ---------------------------------------------------------------------------
// CommentForm
// ---------------------------------------------------------------------------

function CommentForm({
  onSubmit,
  placeholder,
  submitLabel,
  autoFocus,
  onCancel,
}: {
  onSubmit: (content: string) => Promise<void>;
  placeholder: string;
  submitLabel: string;
  autoFocus?: boolean;
  onCancel?: () => void;
}) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus();
  }, [autoFocus]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full resize-y rounded-xl border border-white/10 bg-obsidian/60 px-4 py-3 text-sm text-cream placeholder:text-cream/25 focus:border-gold-300/50 focus:outline-none focus:ring-1 focus:ring-gold-300/20 transition-colors"
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={!content.trim() || submitting}
          className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-5 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-obsidian transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-cream/50 transition-colors hover:border-white/20 hover:text-cream/70"
          >
            Abbrechen
          </button>
        )}
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// SingleComment
// ---------------------------------------------------------------------------

function SingleComment({
  comment,
  depth,
  onReply,
  onDelete,
  onPin,
  currentUserId,
  isCurrentUserAdmin,
}: {
  comment: Comment;
  depth: number;
  onReply: (parentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onPin: (commentId: string, pin: boolean) => Promise<void>;
  currentUserId: string | null;
  isCurrentUserAdmin: boolean;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isOwn = currentUserId === comment.user_id;
  const canDelete = isOwn || isCurrentUserAdmin;
  const canPin = isCurrentUserAdmin;

  async function handleReply(content: string) {
    await onReply(comment.id, content);
    setShowReplyForm(false);
  }

  return (
    <div
      className={cn(
        "group",
        depth > 0 && "ml-6 sm:ml-10 border-l border-white/[0.06] pl-4 sm:pl-6"
      )}
    >
      <div className="flex gap-3 py-3">
        {/* Avatar */}
        <div className={cn(
          "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold uppercase",
          comment.is_admin
            ? "bg-gold-300/15 text-gold-300 border border-gold-300/30"
            : "bg-white/[0.06] text-cream/50 border border-white/10"
        )}>
          {avatarInitial(comment.author.full_name, comment.author.email)}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-cream/90">
              {displayName(comment.author)}
            </span>
            {comment.is_admin && (
              <span className="inline-flex items-center gap-1 rounded-full border border-gold-300/25 bg-gold-300/[0.08] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-gold-300">
                <Shield className="h-2.5 w-2.5" />
                Admin
              </span>
            )}
            {comment.is_pinned && (
              <span className="inline-flex items-center gap-1 rounded-full border border-gold-300/25 bg-gold-300/[0.08] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-gold-300">
                <Pin className="h-2.5 w-2.5" />
                Angepinnt
              </span>
            )}
            <span className="text-[11px] text-cream/30">
              {relativeTime(comment.created_at)}
            </span>
          </div>

          <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-cream/65">
            {comment.content}
          </p>

          {/* Actions */}
          <div className="mt-2 flex items-center gap-3 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <button
              type="button"
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-cream/35 transition-colors hover:text-cream/70"
            >
              <Reply className="h-3 w-3" />
              Antworten
            </button>
            {canPin && (
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  startTransition(() => {
                    onPin(comment.id, !comment.is_pinned);
                  })
                }
                className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-cream/35 transition-colors hover:text-gold-300"
              >
                <Pin className="h-3 w-3" />
                {comment.is_pinned ? "Loslösen" : "Anpinnen"}
              </button>
            )}
            {canDelete && (
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  startTransition(() => {
                    onDelete(comment.id);
                  })
                }
                className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-cream/35 transition-colors hover:text-red-400"
              >
                <Trash2 className="h-3 w-3" />
                Löschen
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reply form */}
      {showReplyForm && (
        <div className="ml-11 mt-1 mb-3">
          <CommentForm
            onSubmit={handleReply}
            placeholder={`Antwort an ${displayName(comment.author)}...`}
            submitLabel="Antworten"
            autoFocus
            onCancel={() => setShowReplyForm(false)}
          />
        </div>
      )}

      {/* Nested replies */}
      {comment.replies.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <SingleComment
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              onReply={onReply}
              onDelete={onDelete}
              onPin={onPin}
              currentUserId={currentUserId}
              isCurrentUserAdmin={isCurrentUserAdmin}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// LessonComments — main export
// ---------------------------------------------------------------------------

export function LessonComments({
  lessonId,
  courseSlug,
}: {
  lessonId: string;
  courseSlug: string;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false);

  // Optimistic UI via useOptimistic
  const [optimisticComments, addOptimistic] = useOptimistic(
    comments,
    (state: Comment[], newComment: Comment) => {
      if (newComment.parent_id) {
        // Insert reply into parent
        return state.map((c) =>
          c.id === newComment.parent_id
            ? { ...c, replies: [...c.replies, newComment] }
            : c
        );
      }
      return [...state, newComment];
    }
  );

  // Load comments + current user info
  const load = useCallback(async () => {
    try {
      const data = await getComments(lessonId);
      setComments(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    load();

    // Get current user for ownership checks
    (async () => {
      try {
        const { getSupabaseBrowserClient } = await import("@/lib/supabase");
        const { hasSupabasePublicEnv } = await import("@/lib/env");
        if (!hasSupabasePublicEnv()) return;
        const sb = getSupabaseBrowserClient();
        if (!sb) return;
        const {
          data: { user },
        } = await sb.auth.getUser();
        if (user) {
          setCurrentUserId(user.id);
          // Check admin status via email list (client-side check for UI only;
          // server actions enforce separately)
          const { isAdminEmail } = await import("@/lib/admin");
          setIsCurrentUserAdmin(isAdminEmail(user.email));
        }
      } catch {
        // ignore
      }
    })();
  }, [load]);

  // Reload when lesson changes
  useEffect(() => {
    setLoading(true);
    load();
  }, [lessonId, load]);

  // ── Handlers ──

  async function handleAddComment(content: string) {
    // Create optimistic comment
    const optimistic: Comment = {
      id: `optimistic-${Date.now()}`,
      lesson_id: lessonId,
      user_id: currentUserId ?? "",
      parent_id: null,
      content,
      is_pinned: false,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: null,
      author: { id: currentUserId ?? "", full_name: null, email: null },
      is_admin: isCurrentUserAdmin,
      replies: [],
    };
    addOptimistic(optimistic);

    const result = await addComment(lessonId, content);
    if (result.ok) {
      await load(); // Refresh with real data
    }
  }

  async function handleReply(parentId: string, content: string) {
    const optimistic: Comment = {
      id: `optimistic-${Date.now()}`,
      lesson_id: lessonId,
      user_id: currentUserId ?? "",
      parent_id: parentId,
      content,
      is_pinned: false,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: null,
      author: { id: currentUserId ?? "", full_name: null, email: null },
      is_admin: isCurrentUserAdmin,
      replies: [],
    };
    addOptimistic(optimistic);

    const result = await addComment(lessonId, content, parentId);
    if (result.ok) {
      await load();
    }
  }

  async function handleDelete(commentId: string) {
    const result = await deleteComment(commentId);
    if (result.ok) {
      await load();
    }
  }

  async function handlePin(commentId: string, pin: boolean) {
    const result = await pinComment(commentId, pin);
    if (result.ok) {
      await load();
    }
  }

  // ── Render ──

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-12">
        <Loader2 className="h-5 w-5 animate-spin text-gold-300/50" />
        <span className="text-sm text-cream/40">Kommentare laden...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <MessageSquare aria-hidden className="h-5 w-5 text-gold-300" />
        <h3 className="font-heading text-lg uppercase tracking-gta text-cream">
          Diskussion
        </h3>
        {optimisticComments.length > 0 && (
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[10px] font-bold text-cream/40">
            {optimisticComments.length}
          </span>
        )}
        <span className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
      </div>

      {/* New comment form */}
      {currentUserId ? (
        <CommentForm
          onSubmit={handleAddComment}
          placeholder="Stell eine Frage oder teile deine Gedanken..."
          submitLabel="Kommentieren"
        />
      ) : (
        <p className="text-sm text-cream/40">
          Melde dich an, um zu kommentieren.
        </p>
      )}

      {/* Comments list */}
      {optimisticComments.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/[0.08] px-6 py-12 text-center">
          <MessageSquare className="h-8 w-8 text-cream/15" aria-hidden />
          <p className="text-sm font-medium text-cream/50">
            Sei der Erste! Stell eine Frage oder teile deine Gedanken.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-white/[0.04]">
          {optimisticComments.map((comment) => (
            <SingleComment
              key={comment.id}
              comment={comment}
              depth={0}
              onReply={handleReply}
              onDelete={handleDelete}
              onPin={handlePin}
              currentUserId={currentUserId}
              isCurrentUserAdmin={isCurrentUserAdmin}
            />
          ))}
        </div>
      )}
    </div>
  );
}
