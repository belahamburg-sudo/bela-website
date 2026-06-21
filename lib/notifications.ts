"use server";

import { getSupabaseAdminClient } from "./supabase";

export type NotificationType =
  | "achievement"
  | "comment_reply"
  | "course_update"
  | "quiz_passed"
  | "streak"
  | "system";

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  body?: string,
  link?: string
): Promise<void> {
  const admin = getSupabaseAdminClient();
  if (!admin) return;

  await admin.from("notifications").insert({
    user_id: userId,
    type,
    title,
    body: body ?? null,
    link: link ?? null,
  });
}
