"use server";

import { getSupabaseServerClient } from "@/lib/supabase-server";
import { hasSupabasePublicEnv } from "@/lib/env";

export type NotificationRow = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
};

export async function getNotifications(
  limit = 20,
  offset = 0
): Promise<{ notifications: NotificationRow[]; unreadCount: number }> {
  if (!hasSupabasePublicEnv()) return { notifications: [], unreadCount: 0 };

  const supabase = await getSupabaseServerClient();
  if (!supabase) return { notifications: [], unreadCount: 0 };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { notifications: [], unreadCount: 0 };

  // Fetch paginated notifications
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  // Fetch unread count separately (always total, not paginated)
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("read", false);

  return {
    notifications: (notifications ?? []) as NotificationRow[],
    unreadCount: count ?? 0,
  };
}

export async function markAsRead(
  notificationId: string
): Promise<{ ok: boolean }> {
  if (!hasSupabasePublicEnv()) return { ok: false };

  const supabase = await getSupabaseServerClient();
  if (!supabase) return { ok: false };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  return { ok: !error };
}

export async function markAllAsRead(): Promise<{ ok: boolean }> {
  if (!hasSupabasePublicEnv()) return { ok: false };

  const supabase = await getSupabaseServerClient();
  if (!supabase) return { ok: false };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false);

  return { ok: !error };
}

export async function toggleRead(
  notificationId: string,
  read: boolean
): Promise<{ ok: boolean }> {
  if (!hasSupabasePublicEnv()) return { ok: false };

  const supabase = await getSupabaseServerClient();
  if (!supabase) return { ok: false };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { error } = await supabase
    .from("notifications")
    .update({ read })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  return { ok: !error };
}
