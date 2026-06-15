"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, getAdminContext, logAudit } from "@/lib/admin";
import { BUCKETS, deleteFromBucket, uploadToBucket } from "@/lib/storage";

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

/**
 * Overwrites an existing object in the public media bucket in place, keeping the
 * same path (and therefore the same public URL) so every page that references
 * the file picks up the new version automatically. The uploaded File is read
 * from the FormData and written with upsert so the existing object is replaced.
 */
export async function replaceMediaObject(formData: FormData): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if (!ctx) return { ok: false, error: "Nicht autorisiert." };

  const path = String(formData.get("path") ?? "").trim();
  if (!path) return { ok: false, error: "Kein Pfad angegeben." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Keine Datei ausgewählt." };
  }

  try {
    const body = new Uint8Array(await file.arrayBuffer());
    await uploadToBucket({
      bucket: BUCKETS.media,
      path,
      body,
      contentType: file.type || undefined,
      upsert: true,
    });
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Ersetzen fehlgeschlagen.",
    };
  }

  await logAudit({
    actorEmail: ctx.user.email,
    action: "media.replace",
    entity: "storage",
    entityId: `${BUCKETS.media}/${path}`,
    meta: { path, fileName: file.name, size: file.size, contentType: file.type },
  });

  revalidatePath("/admin/medien");
  return { ok: true };
}
