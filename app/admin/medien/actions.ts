"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, logAudit } from "@/lib/admin";
import { BUCKETS, deleteFromBucket } from "@/lib/storage";

type ActionResult = { ok: boolean; error?: string };

/** Deletes an object from the public media bucket. */
export async function deleteMediaObject(path: string): Promise<ActionResult> {
  const trimmed = path?.trim();
  if (!trimmed) return { ok: false, error: "Kein Pfad angegeben." };

  const { user } = await requireAdmin();

  try {
    await deleteFromBucket(BUCKETS.media, trimmed);
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Löschen fehlgeschlagen.",
    };
  }

  await logAudit({
    actorEmail: user.email,
    action: "media.delete",
    entity: "storage",
    entityId: `${BUCKETS.media}/${trimmed}`,
    meta: { path: trimmed },
  });

  revalidatePath("/admin/medien");
  return { ok: true };
}
