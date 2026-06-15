"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, logAudit } from "@/lib/admin";
import { berlinLocalToIso } from "@/lib/webinar-format";

type ActionResult = { ok: boolean; error?: string };

export type WebinarInput = {
  title: string;
  subtitle?: string | null;
  description?: string | null;
  startsAt?: string | null;
  url?: string | null;
  isActive?: boolean;
};

/**
 * Normalises a `datetime-local` value into an ISO string (or null). The value
 * is interpreted as Europe/Berlin wall-clock — NOT the server's UTC — so "19:00"
 * entered in the admin is stored as 19:00 Berlin and shows as 19:00 everywhere.
 */
function toIso(value?: string | null): string | null {
  return berlinLocalToIso(value);
}

function clean(value?: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** Creates a new webinar. */
export async function createWebinar(input: WebinarInput): Promise<ActionResult> {
  const title = clean(input.title);
  if (!title) return { ok: false, error: "Titel ist erforderlich." };

  const { user, supabase } = await requireAdmin();

  const { data, error } = await supabase
    .from("webinars")
    .insert({
      title,
      subtitle: clean(input.subtitle),
      description: clean(input.description),
      starts_at: toIso(input.startsAt),
      url: clean(input.url),
      is_active: input.isActive ?? false,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  await logAudit({
    actorEmail: user.email,
    action: "webinar.create",
    entity: "webinars",
    entityId: data?.id ?? null,
    meta: { title },
  });

  revalidatePath("/admin/webinar");
  return { ok: true };
}

/** Updates an existing webinar. */
export async function updateWebinar(
  input: WebinarInput & { id: string }
): Promise<ActionResult> {
  if (!input.id) return { ok: false, error: "Keine Webinar-ID angegeben." };
  const title = clean(input.title);
  if (!title) return { ok: false, error: "Titel ist erforderlich." };

  const { user, supabase } = await requireAdmin();

  const { error } = await supabase
    .from("webinars")
    .update({
      title,
      subtitle: clean(input.subtitle),
      description: clean(input.description),
      starts_at: toIso(input.startsAt),
      url: clean(input.url),
      is_active: input.isActive ?? false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.id);

  if (error) return { ok: false, error: error.message };

  await logAudit({
    actorEmail: user.email,
    action: "webinar.update",
    entity: "webinars",
    entityId: input.id,
    meta: { title },
  });

  revalidatePath("/admin/webinar");
  return { ok: true };
}

/** Toggles the public visibility of a webinar. */
export async function toggleWebinarActive(input: {
  id: string;
  isActive: boolean;
}): Promise<ActionResult> {
  if (!input.id) return { ok: false, error: "Keine Webinar-ID angegeben." };

  const { user, supabase } = await requireAdmin();

  const { error } = await supabase
    .from("webinars")
    .update({ is_active: input.isActive, updated_at: new Date().toISOString() })
    .eq("id", input.id);

  if (error) return { ok: false, error: error.message };

  await logAudit({
    actorEmail: user.email,
    action: "webinar.toggle_active",
    entity: "webinars",
    entityId: input.id,
    meta: { is_active: input.isActive },
  });

  revalidatePath("/admin/webinar");
  return { ok: true };
}

/** Deletes a webinar. */
export async function deleteWebinar(id: string): Promise<ActionResult> {
  if (!id) return { ok: false, error: "Keine Webinar-ID angegeben." };

  const { user, supabase } = await requireAdmin();

  const { error } = await supabase.from("webinars").delete().eq("id", id);

  if (error) return { ok: false, error: error.message };

  await logAudit({
    actorEmail: user.email,
    action: "webinar.delete",
    entity: "webinars",
    entityId: id,
  });

  revalidatePath("/admin/webinar");
  return { ok: true };
}
