"use server";

import { revalidatePath } from "next/cache";
import { getAdminContext, logAudit } from "@/lib/admin";

type ActionResult = { ok: boolean; error?: string };

/** Manually override the Telegram subscription status for a user. */
export async function updateTelegramStatus(input: {
  userId: string;
  status: "active" | "inactive";
}): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if (!ctx) return { ok: false, error: "Nicht autorisiert. Bitte neu anmelden." };
  const { user, supabase } = ctx;

  if (!input.userId) return { ok: false, error: "Keine Benutzer-ID angegeben" };

  const { error } = await supabase
    .from("telegram_subscriptions")
    .update({ status: input.status, updated_at: new Date().toISOString() })
    .eq("user_id", input.userId);

  if (error) return { ok: false, error: error.message };

  await logAudit({
    actorEmail: user.email,
    action: "telegram.status",
    entity: "telegram_subscription",
    entityId: input.userId,
    meta: { status: input.status },
  });

  revalidatePath("/admin/telegram");
  return { ok: true };
}
