"use server";

import { revalidatePath } from "next/cache";
import { hasSupabasePublicEnv } from "@/lib/env";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { isAdminEmail } from "@/lib/admin";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CommentAuthor = {
  id: string;
  full_name: string | null;
  email: string | null;
};

export type Comment = {
  id: string;
  lesson_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  is_pinned: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string | null;
  author: CommentAuthor;
  is_admin: boolean;
  replies: Comment[];
};

type ActionResult = { ok: boolean; error?: string };

// ---------------------------------------------------------------------------
// getComments — fetch threaded comments for a lesson
// ---------------------------------------------------------------------------

export async function getComments(lessonId: string): Promise<Comment[]> {
  if (!lessonId || !hasSupabasePublicEnv()) return [];

  const supabase = await getSupabaseServerClient();
  if (!supabase) return [];

  // Use admin client to join profiles (service-role bypasses RLS on profiles)
  const admin = getSupabaseAdminClient();
  const client = admin ?? supabase;

  const { data: rows, error } = await client
    .from("lesson_comments")
    .select("*")
    .eq("lesson_id", lessonId)
    .eq("is_deleted", false)
    .order("created_at", { ascending: true });

  if (error || !rows) return [];

  // Resolve author profiles
  const userIds = Array.from(new Set(rows.map((r: { user_id: string }) => r.user_id)));
  const profileMap = new Map<string, CommentAuthor>();

  if (userIds.length > 0 && admin) {
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, full_name, email")
      .in("id", userIds);

    for (const p of (profiles ?? []) as CommentAuthor[]) {
      profileMap.set(p.id, p);
    }
  }

  // Build flat comment list with author info
  const flat: Comment[] = rows.map(
    (r: {
      id: string;
      lesson_id: string;
      user_id: string;
      parent_id: string | null;
      content: string;
      is_pinned: boolean;
      is_deleted: boolean;
      created_at: string;
      updated_at: string | null;
    }) => {
      const author = profileMap.get(r.user_id) ?? {
        id: r.user_id,
        full_name: null,
        email: null,
      };
      return {
        id: r.id,
        lesson_id: r.lesson_id,
        user_id: r.user_id,
        parent_id: r.parent_id,
        content: r.content,
        is_pinned: r.is_pinned,
        is_deleted: r.is_deleted,
        created_at: r.created_at,
        updated_at: r.updated_at,
        author,
        is_admin: isAdminEmail(author.email),
        replies: [],
      };
    }
  );

  // Thread: collect top-level + nest replies
  const byId = new Map(flat.map((c) => [c.id, c]));
  const topLevel: Comment[] = [];

  for (const c of flat) {
    if (c.parent_id && byId.has(c.parent_id)) {
      byId.get(c.parent_id)!.replies.push(c);
    } else {
      topLevel.push(c);
    }
  }

  // Pinned first, then chronological
  topLevel.sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  return topLevel;
}

// ---------------------------------------------------------------------------
// addComment
// ---------------------------------------------------------------------------

export async function addComment(
  lessonId: string,
  content: string,
  parentId?: string | null
): Promise<{ ok: boolean; comment?: Comment; error?: string }> {
  if (!content.trim()) return { ok: false, error: "Kommentar darf nicht leer sein." };
  if (!hasSupabasePublicEnv()) return { ok: false, error: "Keine Datenbankverbindung." };

  const supabase = await getSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Nicht authentifiziert." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Nicht authentifiziert." };

  const { data, error } = await supabase
    .from("lesson_comments")
    .insert({
      lesson_id: lessonId,
      user_id: user.id,
      parent_id: parentId || null,
      content: content.trim(),
    })
    .select()
    .single();

  if (error) return { ok: false, error: error.message };

  // Resolve author for the returned comment
  const admin = getSupabaseAdminClient();
  let author: CommentAuthor = { id: user.id, full_name: null, email: user.email ?? null };
  if (admin) {
    const { data: profile } = await admin
      .from("profiles")
      .select("id, full_name, email")
      .eq("id", user.id)
      .maybeSingle();
    if (profile) author = profile as CommentAuthor;
  }

  const comment: Comment = {
    id: data.id,
    lesson_id: data.lesson_id,
    user_id: data.user_id,
    parent_id: data.parent_id,
    content: data.content,
    is_pinned: data.is_pinned,
    is_deleted: data.is_deleted,
    created_at: data.created_at,
    updated_at: data.updated_at,
    author,
    is_admin: isAdminEmail(author.email),
    replies: [],
  };

  return { ok: true, comment };
}

// ---------------------------------------------------------------------------
// deleteComment (soft delete)
// ---------------------------------------------------------------------------

export async function deleteComment(commentId: string): Promise<ActionResult> {
  if (!commentId) return { ok: false, error: "Keine Kommentar-ID." };
  if (!hasSupabasePublicEnv()) return { ok: false, error: "Keine Datenbankverbindung." };

  const supabase = await getSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Nicht authentifiziert." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Nicht authentifiziert." };

  const isAdmin = isAdminEmail(user.email);

  if (isAdmin) {
    // Admin can delete any comment (use admin client to bypass RLS)
    const admin = getSupabaseAdminClient();
    if (!admin) return { ok: false, error: "Admin-Zugang fehlt." };

    const { error } = await admin
      .from("lesson_comments")
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq("id", commentId);

    if (error) return { ok: false, error: error.message };
  } else {
    // Regular user can only soft-delete own comments (RLS enforces user_id)
    const { error } = await supabase
      .from("lesson_comments")
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq("id", commentId)
      .eq("user_id", user.id);

    if (error) return { ok: false, error: error.message };
  }

  return { ok: true };
}

// ---------------------------------------------------------------------------
// pinComment (admin only)
// ---------------------------------------------------------------------------

export async function pinComment(
  commentId: string,
  pin: boolean
): Promise<ActionResult> {
  if (!commentId) return { ok: false, error: "Keine Kommentar-ID." };
  if (!hasSupabasePublicEnv()) return { ok: false, error: "Keine Datenbankverbindung." };

  const supabase = await getSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Nicht authentifiziert." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Nicht authentifiziert." };

  if (!isAdminEmail(user.email)) {
    return { ok: false, error: "Nur Admins können Kommentare anpinnen." };
  }

  const admin = getSupabaseAdminClient();
  if (!admin) return { ok: false, error: "Admin-Zugang fehlt." };

  const { error } = await admin
    .from("lesson_comments")
    .update({ is_pinned: pin, updated_at: new Date().toISOString() })
    .eq("id", commentId);

  if (error) return { ok: false, error: error.message };

  return { ok: true };
}
