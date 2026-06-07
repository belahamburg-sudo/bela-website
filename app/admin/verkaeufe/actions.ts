"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, logAudit } from "@/lib/admin";

type ActionResult = { ok: boolean; error?: string };

/** Marks a purchase as paid. */
export async function markPurchasePaid(id: string): Promise<ActionResult> {
  if (!id) return { ok: false, error: "Keine Verkaufs-ID angegeben." };

  const { user, supabase } = await requireAdmin();

  const { error } = await supabase
    .from("purchases")
    .update({ status: "paid" })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };

  await logAudit({
    actorEmail: user.email,
    action: "purchase.mark_paid",
    entity: "purchases",
    entityId: id,
  });

  revalidatePath("/admin/verkaeufe");
  return { ok: true };
}

/** Deletes a purchase. */
export async function deletePurchase(id: string): Promise<ActionResult> {
  if (!id) return { ok: false, error: "Keine Verkaufs-ID angegeben." };

  const { user, supabase } = await requireAdmin();

  const { error } = await supabase.from("purchases").delete().eq("id", id);

  if (error) return { ok: false, error: error.message };

  await logAudit({
    actorEmail: user.email,
    action: "purchase.delete",
    entity: "purchases",
    entityId: id,
  });

  revalidatePath("/admin/verkaeufe");
  return { ok: true };
}
