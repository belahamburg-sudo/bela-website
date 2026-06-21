"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, logAudit } from "@/lib/admin";

type ActionResult = { ok: boolean; error?: string };

export type TicketMessage = {
  id: string;
  ticket_id: string;
  sender_id: string | null;
  is_admin: boolean;
  content: string;
  created_at: string;
};

export type Ticket = {
  id: string;
  user_id: string;
  email: string | null;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
};

export type TicketWithMessages = Ticket & {
  ticket_messages: TicketMessage[];
};

/** Fetch all tickets (optionally filtered by status), with messages. */
export async function getAllTickets(
  statusFilter?: string
): Promise<TicketWithMessages[]> {
  const { supabase } = await requireAdmin();

  let query = supabase
    .from("support_tickets")
    .select("*, ticket_messages(*)")
    .order("updated_at", { ascending: false });

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[admin/support] getAllTickets:", error.message);
    return [];
  }

  return (data ?? []).map((t) => ({
    ...t,
    ticket_messages: (t.ticket_messages ?? []).sort(
      (a: TicketMessage, b: TicketMessage) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    ),
  }));
}

/** Admin replies to a ticket (is_admin = true). */
export async function adminReply(
  ticketId: string,
  content: string
): Promise<ActionResult> {
  const trimmed = content?.trim();
  if (!ticketId) return { ok: false, error: "Keine Ticket-ID." };
  if (!trimmed) return { ok: false, error: "Nachricht darf nicht leer sein." };

  const { user, supabase } = await requireAdmin();

  const { error } = await supabase.from("ticket_messages").insert({
    ticket_id: ticketId,
    sender_id: user.id,
    is_admin: true,
    content: trimmed,
  });

  if (error) return { ok: false, error: error.message };

  // Update ticket: set status to in_progress if it was open, update timestamp
  const { data: ticket } = await supabase
    .from("support_tickets")
    .select("status")
    .eq("id", ticketId)
    .single();

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (ticket?.status === "open") {
    updates.status = "in_progress";
  }

  await supabase.from("support_tickets").update(updates).eq("id", ticketId);

  await logAudit({
    actorEmail: user.email,
    action: "support.reply",
    entity: "support_tickets",
    entityId: ticketId,
    meta: { contentLength: trimmed.length },
  });

  revalidatePath("/admin/support");
  return { ok: true };
}

/** Update ticket status. */
export async function updateTicketStatus(
  ticketId: string,
  status: string
): Promise<ActionResult> {
  if (!ticketId) return { ok: false, error: "Keine Ticket-ID." };

  const validStatuses = ["open", "in_progress", "resolved", "closed"];
  if (!validStatuses.includes(status)) {
    return { ok: false, error: "Ungültiger Status." };
  }

  const { user, supabase } = await requireAdmin();

  const { error } = await supabase
    .from("support_tickets")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", ticketId);

  if (error) return { ok: false, error: error.message };

  await logAudit({
    actorEmail: user.email,
    action: "support.status_change",
    entity: "support_tickets",
    entityId: ticketId,
    meta: { status },
  });

  revalidatePath("/admin/support");
  return { ok: true };
}

/** Update ticket priority. */
export async function updateTicketPriority(
  ticketId: string,
  priority: string
): Promise<ActionResult> {
  if (!ticketId) return { ok: false, error: "Keine Ticket-ID." };

  const validPriorities = ["low", "normal", "high", "urgent"];
  if (!validPriorities.includes(priority)) {
    return { ok: false, error: "Ungültige Priorität." };
  }

  const { user, supabase } = await requireAdmin();

  const { error } = await supabase
    .from("support_tickets")
    .update({ priority, updated_at: new Date().toISOString() })
    .eq("id", ticketId);

  if (error) return { ok: false, error: error.message };

  await logAudit({
    actorEmail: user.email,
    action: "support.priority_change",
    entity: "support_tickets",
    entityId: ticketId,
    meta: { priority },
  });

  revalidatePath("/admin/support");
  return { ok: true };
}
