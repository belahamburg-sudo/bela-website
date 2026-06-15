"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, getAdminContext, logAudit } from "@/lib/admin";
import { BUCKETS, deleteFromBucket, publicUrl, uploadToBucket } from "@/lib/storage";
import { SITE_IMAGE_SLOTS, siteImageSettingKey } from "@/lib/site-images";

type ActionResult = { ok: boolean; error?: string };

const VALID_SLOT_KEYS = new Set(SITE_IMAGE_SLOTS.map((s) => s.key));

function extFromFile(file: File): string {
  const fromName = file.name.includes(".") ? file.name.split(".").pop() ?? "" : "";
  const clean = fromName.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (clean) return clean;
  const fromType = file.type.split("/").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");
  return fromType || "bin";
}

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

/**
 * Assigns a new image to a website slot ("Website-Bilder"). Uploads the file to
 * the public media bucket under `site/<key>-<timestamp>.<ext>` and stores the
 * resulting public URL in `site_settings` under `img:<key>`. Pages that read
 * the slot via getSiteImage() pick up the new image immediately.
 */
export async function setSiteImage(formData: FormData): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if (!ctx) return { ok: false, error: "Nicht autorisiert." };

  const slotKey = String(formData.get("key") ?? "").trim();
  if (!slotKey || !VALID_SLOT_KEYS.has(slotKey)) {
    return { ok: false, error: "Unbekannter Bild-Slot." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Keine Datei ausgewählt." };
  }

  const path = `site/${slotKey}-${Date.now()}.${extFromFile(file)}`;

  let url: string | null = null;
  try {
    const body = new Uint8Array(await file.arrayBuffer());
    await uploadToBucket({
      bucket: BUCKETS.media,
      path,
      body,
      contentType: file.type || undefined,
      upsert: true,
    });
    url = publicUrl(BUCKETS.media, path);
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Upload fehlgeschlagen.",
    };
  }

  if (!url) return { ok: false, error: "Öffentliche URL konnte nicht erzeugt werden." };

  const settingKey = siteImageSettingKey(slotKey);
  const { error } = await ctx.supabase
    .from("site_settings")
    .upsert(
      { key: settingKey, value: { url }, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );
  if (error) return { ok: false, error: error.message };

  await logAudit({
    actorEmail: ctx.user.email,
    action: "site_image.set",
    entity: "site_settings",
    entityId: settingKey,
    meta: { slot: slotKey, path, url, fileName: file.name, size: file.size },
  });

  revalidatePath("/admin/medien");
  revalidatePath("/about");
  return { ok: true };
}

/** Removes a website slot override so the original static image shows again. */
export async function resetSiteImage(slotKey: string): Promise<ActionResult> {
  const ctx = await getAdminContext();
  if (!ctx) return { ok: false, error: "Nicht autorisiert." };

  const key = slotKey?.trim();
  if (!key || !VALID_SLOT_KEYS.has(key)) {
    return { ok: false, error: "Unbekannter Bild-Slot." };
  }

  const settingKey = siteImageSettingKey(key);
  const { error } = await ctx.supabase
    .from("site_settings")
    .delete()
    .eq("key", settingKey);
  if (error) return { ok: false, error: error.message };

  await logAudit({
    actorEmail: ctx.user.email,
    action: "site_image.reset",
    entity: "site_settings",
    entityId: settingKey,
    meta: { slot: key },
  });

  revalidatePath("/admin/medien");
  revalidatePath("/about");
  return { ok: true };
}
