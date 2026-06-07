"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, logAudit } from "@/lib/admin";

type ActionResult = { ok: boolean; error?: string };

/**
 * Upserts a single site setting. The value is an arbitrary JSON object that is
 * stored in the jsonb `value` column.
 */
export async function upsertSetting(input: {
  key: string;
  value: Record<string, unknown>;
}): Promise<ActionResult> {
  const key = input.key?.trim();
  if (!key) return { ok: false, error: "Schlüssel ist erforderlich." };
  if (input.value === null || typeof input.value !== "object") {
    return { ok: false, error: "Wert muss ein JSON-Objekt sein." };
  }

  const { user, supabase } = await requireAdmin();

  const { error } = await supabase
    .from("site_settings")
    .upsert(
      { key, value: input.value, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );

  if (error) return { ok: false, error: error.message };

  await logAudit({
    actorEmail: user.email,
    action: "setting.upsert",
    entity: "site_settings",
    entityId: key,
    meta: { key },
  });

  revalidatePath("/admin/einstellungen");
  return { ok: true };
}

/** Deletes a site setting by key. */
export async function deleteSetting(key: string): Promise<ActionResult> {
  const trimmed = key?.trim();
  if (!trimmed) return { ok: false, error: "Kein Schlüssel angegeben." };

  const { user, supabase } = await requireAdmin();

  const { error } = await supabase.from("site_settings").delete().eq("key", trimmed);

  if (error) return { ok: false, error: error.message };

  await logAudit({
    actorEmail: user.email,
    action: "setting.delete",
    entity: "site_settings",
    entityId: trimmed,
  });

  revalidatePath("/admin/einstellungen");
  return { ok: true };
}
