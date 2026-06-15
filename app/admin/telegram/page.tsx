import { Send, CircleCheck, CircleOff, ExternalLink, TriangleAlert } from "lucide-react";
import { PageHeader, StatCard, Panel, KeyValue } from "@/components/admin/ui";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { telegramUrl, paidTelegramUrl } from "@/lib/env";
import { TelegramTable, type TelegramRow } from "@/components/admin/comms/telegram-table";

export const dynamic = "force-dynamic";

type SubscriptionRow = {
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: string;
  current_period_end: string | null;
  created_at: string;
};

/**
 * Load all Telegram subscriptions + resolved emails.
 *
 * Fully defensive: every Supabase call is wrapped so that a transient
 * network/REST error, a schema-cache miss, or a missing service-role client
 * can never bubble up and turn the whole route into a production
 * "server-side exception". On any failure we return an empty list plus a flag
 * so the page can render a small inline notice instead of crashing.
 */
async function loadTelegramRows(): Promise<{ rows: TelegramRow[]; failed: boolean }> {
  try {
    const admin = getSupabaseAdminClient();
    if (!admin) {
      // Missing service-role env — treat as a soft failure, not a crash.
      return { rows: [], failed: true };
    }

    const { data: subs, error: subsError } = await admin
      .from("telegram_subscriptions")
      .select(
        "user_id, stripe_customer_id, stripe_subscription_id, status, current_period_end, created_at"
      )
      .order("created_at", { ascending: false });

    if (subsError) {
      console.error("[admin/telegram] failed to load subscriptions:", subsError.message);
      return { rows: [], failed: true };
    }

    const subscriptions = (Array.isArray(subs) ? subs : []) as SubscriptionRow[];

    // Resolve emails via a profiles lookup map. A failure here is non-fatal:
    // we still render the rows, just without resolved emails.
    const userIds = subscriptions
      .map((s) => s?.user_id)
      .filter((id): id is string => Boolean(id));
    const emailById = new Map<string, string>();
    if (userIds.length > 0) {
      try {
        const { data: profiles } = await admin
          .from("profiles")
          .select("id, email")
          .in("id", userIds);
        const profileRows = (Array.isArray(profiles) ? profiles : []) as {
          id: string;
          email: string | null;
        }[];
        for (const p of profileRows) {
          if (p?.id && p.email) emailById.set(p.id, p.email);
        }
      } catch (err) {
        console.error(
          "[admin/telegram] failed to resolve emails:",
          err instanceof Error ? err.message : err
        );
      }
    }

    const rows: TelegramRow[] = subscriptions
      .filter((s) => Boolean(s?.user_id))
      .map((s) => ({
        userId: s.user_id,
        email: emailById.get(s.user_id) ?? null,
        stripeCustomerId: s.stripe_customer_id ?? null,
        stripeSubscriptionId: s.stripe_subscription_id ?? null,
        status: typeof s.status === "string" ? s.status : "inactive",
        currentPeriodEnd: s.current_period_end ?? null,
        createdAt: s.created_at ?? null,
      }));

    return { rows, failed: false };
  } catch (err) {
    console.error(
      "[admin/telegram] unexpected error while loading rows:",
      err instanceof Error ? err.message : err
    );
    return { rows: [], failed: true };
  }
}

export default async function TelegramPage() {
  const { rows, failed } = await loadTelegramRows();

  const active = rows.filter((r) => r.status === "active").length;
  const total = rows.length;
  const inactive = total - active;

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <PageHeader
        eyebrow="Kommunikation"
        title="Telegram"
        description="Verwalte die Telegram-Abonnements deiner Community und steuere den Zugang manuell."
      />

      <div className="mt-8 grid grid-cols-3 gap-4">
        <StatCard label="Aktiv" value={active} icon={CircleCheck} hint="laufende Abos" />
        <StatCard label="Inaktiv" value={inactive} icon={CircleOff} hint="pausiert / beendet" />
        <StatCard label="Gesamt" value={total} icon={Send} hint="alle Abonnenten" />
      </div>

      <div className="mt-6">
        <Panel
          title="Konfigurierte Kanäle"
          description="Diese Telegram-Kanäle sind in der Umgebung hinterlegt."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <KeyValue label="Freier Kanal">
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-gold-200 transition-colors hover:text-gold-100"
              >
                {telegramUrl}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </KeyValue>
            <KeyValue label="Bezahlter Kanal">
              <a
                href={paidTelegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-gold-200 transition-colors hover:text-gold-100"
              >
                {paidTelegramUrl}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </KeyValue>
          </div>
        </Panel>
      </div>

      {failed && (
        <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-3 text-sm text-amber-200">
          <TriangleAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>
            Die Abonnentenliste konnte gerade nicht geladen werden. Die Seite
            bleibt nutzbar — bitte später erneut laden.
          </p>
        </div>
      )}

      <div className="mt-6">
        <Panel title="Abonnenten" noPadding>
          <TelegramTable rows={rows} />
        </Panel>
      </div>
    </div>
  );
}
