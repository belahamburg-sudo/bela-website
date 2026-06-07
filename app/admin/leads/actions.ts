"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, logAudit } from "@/lib/admin";

type ActionResult = { ok: boolean; error?: string };

const VALID_STATUSES = ["new", "contacted", "converted", "archived"] as const;
const VALID_SOURCES = ["newsletter", "webinar", "community"] as const;

type LeadStatus = (typeof VALID_STATUSES)[number];
type LeadSource = (typeof VALID_SOURCES)[number];

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Updates the status of a lead. */
export async function updateLeadStatus(input: {
  id: string;
  status: string;
}): Promise<ActionResult> {
  if (!input.id) return { ok: false, error: "Keine Lead-ID angegeben." };
  if (!VALID_STATUSES.includes(input.status as LeadStatus)) {
    return { ok: false, error: "Ungültiger Status." };
  }

  const { user, supabase } = await requireAdmin();

  const { error } = await supabase
    .from("leads")
    .update({ status: input.status })
    .eq("id", input.id);

  if (error) return { ok: false, error: error.message };

  await logAudit({
    actorEmail: user.email,
    action: "lead.update_status",
    entity: "leads",
    entityId: input.id,
    meta: { status: input.status },
  });

  revalidatePath("/admin/leads");
  return { ok: true };
}

/** Creates a new lead. */
export async function createLead(input: {
  email: string;
  name?: string;
  source: string;
}): Promise<ActionResult> {
  const email = input.email.trim().toLowerCase();
  if (!email) return { ok: false, error: "E-Mail ist erforderlich." };
  if (!isValidEmail(email)) return { ok: false, error: "Ungültige E-Mail-Adresse." };
  if (!VALID_SOURCES.includes(input.source as LeadSource)) {
    return { ok: false, error: "Ungültige Quelle." };
  }

  const { user, supabase } = await requireAdmin();

  const name = input.name?.trim() || null;

  const { data, error } = await supabase
    .from("leads")
    .insert({ email, name, source: input.source, status: "new" })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  await logAudit({
    actorEmail: user.email,
    action: "lead.create",
    entity: "leads",
    entityId: data?.id ?? null,
    meta: { email, source: input.source },
  });

  revalidatePath("/admin/leads");
  return { ok: true };
}

/** Deletes a lead. */
export async function deleteLead(id: string): Promise<ActionResult> {
  if (!id) return { ok: false, error: "Keine Lead-ID angegeben." };

  const { user, supabase } = await requireAdmin();

  const { error } = await supabase.from("leads").delete().eq("id", id);

  if (error) return { ok: false, error: error.message };

  await logAudit({
    actorEmail: user.email,
    action: "lead.delete",
    entity: "leads",
    entityId: id,
  });

  revalidatePath("/admin/leads");
  return { ok: true };
}
