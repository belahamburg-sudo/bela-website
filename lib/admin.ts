import { redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "./supabase-server";
import { getSupabaseAdminClient } from "./supabase";

/**
 * Hard-coded admin allowlist. Additional addresses can be supplied via the
 * ADMIN_EMAILS env var (comma-separated) without a code change.
 */
const DEFAULT_ADMIN_EMAILS = ["bela.hamburg@gmail.com", "dr.eddi@icloud.com"];

export function getAdminEmails(): string[] {
  const fromEnv = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return Array.from(new Set([...DEFAULT_ADMIN_EMAILS, ...fromEnv]));
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.trim().toLowerCase());
}

/** Returns the current user + whether they are an admin (no redirect). */
export async function getAdminSession(): Promise<{
  user: User | null;
  isAdmin: boolean;
}> {
  const server = await getSupabaseServerClient();
  if (!server) return { user: null, isAdmin: false };
  const {
    data: { user },
  } = await server.auth.getUser();
  return { user, isAdmin: isAdminEmail(user?.email) };
}

/**
 * Non-redirecting admin guard for use inside SERVER ACTIONS. Returns null when
 * the caller is not an authenticated admin (or the service-role key is missing)
 * instead of throwing a redirect — a redirect thrown from an action would eject
 * the admin out of the panel on a transient auth blip. Pair with an `{ ok:
 * false }` result so the UI can show an error toast and stay put.
 */
export async function getAdminContext(): Promise<{
  user: User;
  supabase: SupabaseClient;
} | null> {
  const { user, isAdmin } = await getAdminSession();
  if (!user || !isAdmin) return null;
  const supabase = getSupabaseAdminClient();
  if (!supabase) return null;
  return { user, supabase };
}

/**
 * Gate for admin server components / actions. Redirects non-admins away and
 * returns the authenticated user plus a service-role client that bypasses RLS.
 */
export async function requireAdmin(): Promise<{
  user: User;
  supabase: SupabaseClient;
}> {
  const { user, isAdmin } = await getAdminSession();
  if (!user) redirect("/login?next=/admin");
  if (!isAdmin) redirect("/");

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not configured — the admin area needs it."
    );
  }
  return { user, supabase };
}

/** Append an entry to the audit log. Best-effort; never throws. */
export async function logAudit(opts: {
  actorEmail?: string | null;
  action: string;
  entity?: string;
  entityId?: string | null;
  meta?: Record<string, unknown>;
}): Promise<void> {
  try {
    const supabase = getSupabaseAdminClient();
    if (!supabase) return;
    await supabase.from("audit_log").insert({
      actor_email: opts.actorEmail ?? null,
      action: opts.action,
      entity: opts.entity ?? null,
      entity_id: opts.entityId ?? null,
      meta: opts.meta ?? {},
    });
  } catch {
    // auditing must never break the actual operation
  }
}
