import { Send, CircleCheck, CircleOff, Hash, ExternalLink } from "lucide-react";
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

export default async function TelegramPage() {
  const admin = getSupabaseAdminClient();

  let rows: TelegramRow[] = [];
  if (admin) {
    const { data: subs } = await admin
      .from("telegram_subscriptions")
      .select(
        "user_id, stripe_customer_id, stripe_subscription_id, status, current_period_end, created_at"
      )
      .order("created_at", { ascending: false });

    const subscriptions = (subs ?? []) as SubscriptionRow[];

    // Resolve emails via a profiles lookup map.
    const userIds = subscriptions.map((s) => s.user_id).filter(Boolean);
    const emailById = new Map<string, string>();
    if (userIds.length > 0) {
      const { data: profiles } = await admin
        .from("profiles")
        .select("id, email")
        .in("id", userIds);
      for (const p of (profiles ?? []) as { id: string; email: string | null }[]) {
        if (p.email) emailById.set(p.id, p.email);
      }
    }

    rows = subscriptions.map((s) => ({
      userId: s.user_id,
      email: emailById.get(s.user_id) ?? null,
      stripeCustomerId: s.stripe_customer_id,
      stripeSubscriptionId: s.stripe_subscription_id,
      status: s.status,
      currentPeriodEnd: s.current_period_end,
      createdAt: s.created_at,
    }));
  }

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

      <div className="mt-6">
        <Panel title="Abonnenten" noPadding>
          <TelegramTable rows={rows} emptyIcon={Hash} />
        </Panel>
      </div>
    </div>
  );
}
