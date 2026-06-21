"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase-server";

type ActionResult = { ok: boolean; error?: string; ticketId?: string };

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

/** Fetch all tickets belonging to the current user, with messages. */
export async function getMyTickets(): Promise<TicketWithMessages[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return [];

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("support_tickets")
    .select("*, ticket_messages(*)")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[support] getMyTickets:", error.message);
    return [];
  }

  // Sort messages within each ticket by created_at ascending
  return (data ?? []).map((t) => ({
    ...t,
    ticket_messages: (t.ticket_messages ?? []).sort(
      (a: TicketMessage, b: TicketMessage) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    ),
  }));
}

/** Create a new support ticket with an initial message. */
export async function createTicket(
  subject: string,
  message: string
): Promise<ActionResult> {
  const trimmedSubject = subject?.trim();
  const trimmedMessage = message?.trim();

  if (!trimmedSubject) return { ok: false, error: "Bitte gib einen Betreff ein." };
  if (!trimmedMessage) return { ok: false, error: "Bitte beschreibe dein Anliegen." };

  const supabase = await getSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Nicht authentifiziert." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Nicht authentifiziert." };

  // Create the ticket
  const { data: ticket, error: ticketError } = await supabase
    .from("support_tickets")
    .insert({
      user_id: user.id,
      email: user.email ?? null,
      subject: trimmedSubject,
      status: "open",
      priority: "normal",
    })
    .select("id")
    .single();

  if (ticketError || !ticket) {
    return { ok: false, error: ticketError?.message ?? "Ticket konnte nicht erstellt werden." };
  }

  // Create the initial message
  const { error: msgError } = await supabase.from("ticket_messages").insert({
    ticket_id: ticket.id,
    sender_id: user.id,
    is_admin: false,
    content: trimmedMessage,
  });

  if (msgError) {
    console.error("[support] createTicket message:", msgError.message);
  }

  revalidatePath("/db/support");
  return { ok: true, ticketId: ticket.id };
}

/** Reply to an existing ticket. */
export async function replyToTicket(
  ticketId: string,
  content: string
): Promise<ActionResult> {
  const trimmedContent = content?.trim();
  if (!ticketId) return { ok: false, error: "Keine Ticket-ID." };
  if (!trimmedContent) return { ok: false, error: "Bitte gib eine Nachricht ein." };

  const supabase = await getSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Nicht authentifiziert." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Nicht authentifiziert." };

  // Verify the ticket belongs to this user (RLS should handle this, but be safe)
  const { data: ticket } = await supabase
    .from("support_tickets")
    .select("id")
    .eq("id", ticketId)
    .eq("user_id", user.id)
    .single();

  if (!ticket) return { ok: false, error: "Ticket nicht gefunden." };

  const { error } = await supabase.from("ticket_messages").insert({
    ticket_id: ticketId,
    sender_id: user.id,
    is_admin: false,
    content: trimmedContent,
  });

  if (error) return { ok: false, error: error.message };

  // Update ticket timestamp
  await supabase
    .from("support_tickets")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", ticketId);

  revalidatePath("/db/support");
  return { ok: true };
}
