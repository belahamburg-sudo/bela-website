import {
  CircleCheck, CircleOff, ExternalLink, TriangleAlert,
  Webhook, Bot, Link2,
} from "lucide-react";
import { PageHeader, StatCard, Panel, KeyValue, AdminBadge } from "@/components/admin/ui";
import { TelegramWebhookButton } from "@/components/admin/telegram-webhook-button";
import { getSupabaseAdminClient } from "@/lib/supabase";
import { telegramUrl, paidTelegramUrl } from "@/lib/env";
import { TelegramTable, type TelegramRow } from "@/components/admin/comms/telegram-table";
import {
  getTelegramWebhookInfo,
  isTelegramBotConfigured,
} from "@/lib/telegram-bot";

export const dynamic = "force-dynamic";

type SubscriptionRow = {
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: string;
  current_period_end: string | null;
  created_at: string;
  telegram_user_id: number | null;
  telegram_username: string | null;
  updated_at: string | null;
};

async function loadTelegramRows(): Promise<{ rows: TelegramRow[]; failed: boolean }> {
  try {
    const admin = getSupabaseAdminClient();
    if (!admin) return { rows: [], failed: true };

    const { data: subs, error: subsError } = await admin
      .from("telegram_subscriptions")
      .select(
        "user_id, stripe_customer_id, stripe_subscription_id, status, current_period_end, created_at, telegram_user_id, telegram_username, updated_at"
      )
      .order("created_at", { ascending: false });

    if (subsError) {
      console.error("[admin/telegram] failed to load subscriptions:", subsError.message);
      return { rows: [], failed: true };
    }

    const subscriptions = (Array.isArray(subs) ? subs : []) as SubscriptionRow[];

    const userIds = subscriptions
      .map((s) => s?.user_id)
      .filter((id): id is string => Boolean(id));
    const emailById = new Map<string, string>();
    const nameById = new Map<string, string>();
    if (userIds.length > 0) {
      try {
        const { data: profiles } = await admin
          .from("profiles")
          .select("id, email, full_name")
          .in("id", userIds);
        for (const p of (profiles ?? []) as { id: string; email: string | null; full_name: string | null }[]) {
          if (p?.id && p.email) emailById.set(p.id, p.email);
          if (p?.id && p.full_name) nameById.set(p.id, p.full_name);
        }
      } catch {}
    }

    const rows: TelegramRow[] = subscriptions
      .filter((s) => Boolean(s?.user_id))
      .map((s) => ({
        userId: s.user_id,
        email: emailById.get(s.user_id) ?? null,
        name: nameById.get(s.user_id) ?? null,
        stripeCustomerId: s.stripe_customer_id ?? null,
        stripeSubscriptionId: s.stripe_subscription_id ?? null,
        status: typeof s.status === "string" ? s.status : "inactive",
        currentPeriodEnd: s.current_period_end ?? null,
        createdAt: s.created_at ?? null,
        telegramUserId: s.telegram_user_id ?? null,
        telegramUsername: s.telegram_username ?? null,
        updatedAt: s.updated_at ?? null,
      }));

    return { rows, failed: false };
  } catch (err) {
    console.error("[admin/telegram] unexpected error:", err instanceof Error ? err.message : err);
    return { rows: [], failed: true };
  }
}

type BotDiagnostics = {
  configured: boolean;
  botToken: boolean;
  chatId: boolean;
  botUsername: boolean;
  webhookSecret: boolean;
  linkSecret: boolean;
  webhookUrl: string | null;
  webhookPending: number;
  webhookError: string | null;
  botName: string | null;
  botUsernameValue: string | null;
};

async function loadBotDiagnostics(): Promise<BotDiagnostics> {
  const configured = isTelegramBotConfigured();
  const diag: BotDiagnostics = {
    configured,
    botToken: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    chatId: Boolean(process.env.TELEGRAM_PAID_CHAT_ID),
    botUsername: Boolean(process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME),
    webhookSecret: Boolean(process.env.TELEGRAM_WEBHOOK_SECRET),
    linkSecret: Boolean(process.env.TELEGRAM_LINK_SECRET || process.env.TELEGRAM_BOT_TOKEN),
    webhookUrl: null,
    webhookPending: 0,
    webhookError: null,
    botName: null,
    botUsernameValue: process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME ?? null,
  };

  if (!configured) return diag;

  try {
    const info = await getTelegramWebhookInfo();
    if (info) {
      diag.webhookUrl = (info as { url?: string }).url ?? null;
      diag.webhookPending = (info as { pending_update_count?: number }).pending_update_count ?? 0;
      diag.webhookError = (info as { last_error_message?: string }).last_error_message ?? null;
    }
  } catch {}

  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (token) {
      const res = await fetch(`https://api.telegram.org/bot${token}/getMe`);
      const data = await res.json() as { ok: boolean; result?: { first_name?: string; username?: string } };
      if (data.ok && data.result) {
        diag.botName = data.result.first_name ?? null;
        diag.botUsernameValue = data.result.username ?? diag.botUsernameValue;
      }
    }
  } catch {}

  return diag;
}

function EnvBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
      ok
        ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
        : "border-red-500/25 bg-red-500/10 text-red-300"
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${ok ? "bg-emerald-400" : "bg-red-400"}`} />
      {label}
    </span>
  );
}

export default async function TelegramPage() {
  const [{ rows, failed }, diag] = await Promise.all([
    loadTelegramRows(),
    loadBotDiagnostics(),
  ]);

  const active = rows.filter((r) => r.status === "active").length;
  const total = rows.length;
  const inactive = total - active;
  const linked = rows.filter((r) => r.telegramUserId).length;
  const unlinked = active - rows.filter((r) => r.status === "active" && r.telegramUserId).length;

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <PageHeader
        eyebrow="Kommunikation"
        title="Telegram"
        description="Verwalte die Telegram-Abonnements deiner Community und steuere den Zugang manuell."
      />

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Aktiv" value={active} icon={CircleCheck} hint="laufende Abos" />
        <StatCard label="Inaktiv" value={inactive} icon={CircleOff} hint="pausiert / beendet" />
        <StatCard
          label="Verknüpft"
          value={linked}
          icon={Link2}
          hint="Telegram verbunden"
        />
        <StatCard
          label="Nicht verknüpft"
          value={unlinked}
          icon={TriangleAlert}
          hint={unlinked > 0 ? "aktiv aber ohne Telegram" : "alle verbunden"}
        />
      </div>

      {/* Bot Diagnostics */}
      <div className="mt-6">
        <Panel title="Bot-Diagnose" description="Live-Status des Telegram-Bots und der Konfiguration.">
          <div className="space-y-5">
            {/* Env Check */}
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-cream/40">Umgebungsvariablen</p>
              <div className="flex flex-wrap gap-2">
                <EnvBadge ok={diag.botToken} label="BOT_TOKEN" />
                <EnvBadge ok={diag.chatId} label="CHAT_ID" />
                <EnvBadge ok={diag.botUsername} label="BOT_USERNAME" />
                <EnvBadge ok={diag.webhookSecret} label="WEBHOOK_SECRET" />
                <EnvBadge ok={diag.linkSecret} label="LINK_SECRET" />
              </div>
            </div>

            {/* Bot Info */}
            {diag.botName && (
              <div className="grid gap-4 sm:grid-cols-3">
                <KeyValue label="Bot-Name">
                  <span className="flex items-center gap-2 text-cream/80">
                    <Bot className="h-3.5 w-3.5 text-gold-300/60" />
                    {diag.botName}
                  </span>
                </KeyValue>
                <KeyValue label="Bot-Username">
                  <a
                    href={`https://t.me/${diag.botUsernameValue}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-gold-200 hover:text-gold-100"
                  >
                    @{diag.botUsernameValue}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </KeyValue>
                <KeyValue label="Chat-ID">
                  <span className="font-mono text-xs text-cream/60">
                    {process.env.TELEGRAM_PAID_CHAT_ID ?? "—"}
                  </span>
                </KeyValue>
              </div>
            )}

            {/* Webhook Status */}
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-cream/40">Webhook</p>
              {diag.webhookUrl ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Webhook className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="font-mono text-xs text-cream/70 break-all">{diag.webhookUrl}</span>
                    <AdminBadge tone="green">aktiv</AdminBadge>
                  </div>
                  {diag.webhookPending > 0 && (
                    <p className="flex items-center gap-2 text-xs text-amber-300">
                      <TriangleAlert className="h-3.5 w-3.5" />
                      {diag.webhookPending} ausstehende Updates — der Webhook-Endpoint ist möglicherweise nicht erreichbar.
                    </p>
                  )}
                  {diag.webhookError && (
                    <p className="flex items-center gap-2 text-xs text-red-300">
                      <TriangleAlert className="h-3.5 w-3.5" />
                      Letzter Fehler: {diag.webhookError}
                    </p>
                  )}
                  {!diag.webhookError && diag.webhookPending === 0 && (
                    <p className="text-xs text-emerald-400/70">Keine Fehler, keine ausstehenden Updates.</p>
                  )}
                </div>
              ) : diag.configured ? (
                <p className="flex items-center gap-2 text-xs text-red-300">
                  <TriangleAlert className="h-3.5 w-3.5" />
                  Kein Webhook registriert — Bot empfängt keine Nachrichten.
                </p>
              ) : (
                <p className="text-xs text-cream/40">Bot ist nicht konfiguriert.</p>
              )}
            </div>

            <TelegramWebhookButton />
          </div>
        </Panel>
      </div>

      {/* Channels */}
      <div className="mt-6">
        <Panel title="Konfigurierte Kanäle" description="Diese Telegram-Kanäle sind in der Umgebung hinterlegt.">
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

      {/* Subscribers Table */}
      <div className="mt-6">
        <Panel title="Abonnenten" description={`${total} Gesamt · ${linked} verknüpft · ${unlinked} ohne Telegram`} noPadding>
          <TelegramTable rows={rows} />
        </Panel>
      </div>
    </div>
  );
}
