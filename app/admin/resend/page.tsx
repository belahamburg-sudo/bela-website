import {
  Mail, Globe, Send, Clock, Hash,
  CircleCheck, CircleOff, TriangleAlert, ExternalLink,
} from "lucide-react";
import { PageHeader, StatCard, Panel, AdminBadge, EmptyState, KeyValue } from "@/components/admin/ui";
import { DataTable, type Column } from "@/components/admin/data-table";
import { FunnelBars } from "@/components/admin/charts";
import {
  getResendDashboard,
  TEMPLATES,
  type ResendDomain,
  type CronEmailStat,
  type BroadcastRecord,
} from "@/lib/resend-dashboard";

export const dynamic = "force-dynamic";

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("de-DE", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function SectionLabel({ children, note }: { children: React.ReactNode; note?: string }) {
  return (
    <div className="mb-4 mt-10 flex items-center gap-3">
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-gold-300/70">{children}</span>
      {note && <span className="text-[11px] text-cream/30">{note}</span>}
      <span className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
    </div>
  );
}

const TEMPLATE_LABELS: Record<string, { name: string; desc: string; auto: boolean }> = {
  "change-email": { name: "E-Mail ändern", desc: "Bestätigungslink bei Adressänderung", auto: true },
  "checkout-abandoned": { name: "Warenkorb-Erinnerung", desc: "Abgebrochener Checkout (Cron, 48h)", auto: true },
  "course-completed": { name: "Kurs abgeschlossen", desc: "Automatisch bei 100% Fortschritt", auto: true },
  "course-unlocked": { name: "Kurs freigeschaltet", desc: "Nach Kauf oder manuellem Unlock", auto: true },
  "invite-user": { name: "Einladung", desc: "Admin lädt Nutzer ein", auto: false },
  "magic-link": { name: "Magic Link", desc: "Passwortloser Login", auto: true },
  "newsletter-double-opt-in": { name: "Newsletter DOI", desc: "Double-Opt-in Bestätigung", auto: true },
  "newsletter-unsubscribe-confirmed": { name: "Abmeldung bestätigt", desc: "Newsletter abgemeldet", auto: true },
  "newsletter-welcome": { name: "Newsletter Willkommen", desc: "Nach DOI-Bestätigung", auto: true },
  "onboarding-complete": { name: "Onboarding fertig", desc: "Profil vollständig ausgefüllt", auto: true },
  "password-reset": { name: "Passwort zurücksetzen", desc: "Passwort-Reset-Link", auto: true },
  "payment-failed": { name: "Zahlung fehlgeschlagen", desc: "Stripe-Webhook bei Fehler", auto: true },
  "purchase-confirmation": { name: "Kaufbestätigung", desc: "Nach erfolgreichem Checkout", auto: true },
  "re-engagement": { name: "Re-Engagement", desc: "14 Tage inaktiv (Cron)", auto: true },
  "reauthentication": { name: "Erneute Anmeldung", desc: "Sicherheits-Bestätigung", auto: true },
  "signup-confirmation": { name: "Registrierung", desc: "E-Mail-Bestätigung bei Signup", auto: true },
  "telegram-free-welcome": { name: "Telegram Free", desc: "Kostenloser Kanal beigetreten", auto: true },
  "telegram-paid-welcome": { name: "Telegram VIP", desc: "VIP-Abo gestartet", auto: true },
  "telegram-subscription-ended": { name: "VIP beendet", desc: "Abo gekündigt/ausgelaufen", auto: true },
  "webinar-registration-confirmed": { name: "Webinar-Anmeldung", desc: "Bestätigung der Anmeldung", auto: true },
  "webinar-reminder-1h": { name: "Webinar in 1h", desc: "Erinnerung 1 Stunde vorher (Cron)", auto: true },
  "webinar-reminder-24h": { name: "Webinar in 24h", desc: "Erinnerung 24 Stunden vorher (Cron)", auto: true },
};

export default async function AdminResendPage() {
  const d = await getResendDashboard();

  if (!d.configured) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <PageHeader eyebrow="Kommunikation" title="E-Mail (Resend)" description="Versand-Übersicht, Domains und Templates." />
        <div className="mt-8">
          <Panel>
            <EmptyState icon={Mail} title="Resend nicht verbunden" description="Setze RESEND_API_KEY in den Umgebungsvariablen." />
          </Panel>
        </div>
      </div>
    );
  }

  const domainColumns: Column<ResendDomain>[] = [
    {
      key: "name",
      header: "Domain",
      render: (r) => <span className="font-medium text-cream/90">{r.name}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (r) => {
        const ok = r.status === "verified";
        return (
          <AdminBadge tone={ok ? "green" : "amber"}>
            {ok ? "Verifiziert" : r.status}
          </AdminBadge>
        );
      },
    },
    {
      key: "region",
      header: "Region",
      render: (r) => <span className="text-xs text-cream/50">{r.region}</span>,
    },
    {
      key: "created_at",
      header: "Erstellt",
      align: "right",
      render: (r) => <span className="text-xs text-cream/50">{fmtDate(r.created_at)}</span>,
    },
  ];

  const cronColumns: Column<CronEmailStat>[] = [
    {
      key: "job",
      header: "Job",
      render: (r) => <span className="font-medium text-cream/90">{r.job}</span>,
    },
    {
      key: "total",
      header: "Gesendet",
      align: "right",
      render: (r) => <span className="font-bold text-cream/90">{r.total}</span>,
    },
    {
      key: "lastSent",
      header: "Zuletzt",
      align: "right",
      render: (r) => <span className="text-xs text-cream/50">{fmtDate(r.lastSent)}</span>,
    },
  ];

  const broadcastColumns: Column<BroadcastRecord>[] = [
    {
      key: "subject",
      header: "Betreff",
      render: (r) => <span className="font-medium text-cream/90 text-xs">{r.subject}</span>,
    },
    {
      key: "template",
      header: "Template",
      render: (r) => <AdminBadge tone="blue">{r.template}</AdminBadge>,
    },
    {
      key: "recipientCount",
      header: "Empfänger",
      align: "right",
      render: (r) => <span className="font-bold text-cream/90">{r.recipientCount}</span>,
    },
    {
      key: "sentAt",
      header: "Gesendet",
      align: "right",
      render: (r) => <span className="text-xs text-cream/50">{fmtDate(r.sentAt)}</span>,
    },
  ];

  const autoTemplates = TEMPLATES.filter((t) => TEMPLATE_LABELS[t]?.auto);
  const manualTemplates = TEMPLATES.filter((t) => !TEMPLATE_LABELS[t]?.auto);
  const verified = d.domains.filter((dom) => dom.status === "verified").length;

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <PageHeader
        eyebrow="Kommunikation"
        title="E-Mail (Resend)"
        description="Domains, Templates und Versandhistorie — alles an einem Ort."
        actions={
          <a
            href="https://resend.com/overview"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs font-bold text-cream/50 hover:text-gold-300 hover:border-gold-300/30"
          >
            Resend öffnen <ExternalLink className="h-3 w-3" />
          </a>
        }
      />

      {/* KPIs */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Domains" value={d.domains.length} icon={Globe} hint={`${verified} verifiziert`} />
        <StatCard label="Templates" value={d.templateCount} icon={Mail} hint={`${autoTemplates.length} auto, ${manualTemplates.length} manuell`} />
        <StatCard label="Cron-Emails" value={d.totalCronEmails} icon={Clock} hint="automatisch versandt" />
        <StatCard label="Broadcasts" value={d.totalBroadcasts} icon={Send} hint="manuelle Kampagnen" />
      </div>

      {/* Domains */}
      <SectionLabel>Domains</SectionLabel>
      <Panel title="Versand-Domains" description="Von Resend verifizierte Absender-Domains" noPadding>
        {d.domains.length === 0 ? (
          <EmptyState icon={Globe} title="Keine Domains" description="Füge eine Domain in Resend hinzu um Emails zu versenden." />
        ) : (
          <DataTable columns={domainColumns} rows={d.domains} getRowKey={(r) => r.id} />
        )}
      </Panel>

      {/* Templates */}
      <SectionLabel>E-Mail-Templates</SectionLabel>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Automatische Emails" description={`${autoTemplates.length} Templates — werden durch Events ausgelöst`}>
          <div className="space-y-2.5">
            {autoTemplates.map((t) => {
              const info = TEMPLATE_LABELS[t] ?? { name: t, desc: "" };
              return (
                <div key={t} className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.01] px-3 py-2.5">
                  <CircleCheck className="h-3.5 w-3.5 flex-shrink-0 text-emerald-400/60" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-cream/80">{info.name}</p>
                    <p className="text-[10px] text-cream/35">{info.desc}</p>
                  </div>
                  <code className="flex-shrink-0 rounded bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-mono text-cream/30">{t}</code>
                </div>
              );
            })}
          </div>
        </Panel>
        <Panel title="Manuelle Emails" description={`${manualTemplates.length} Templates — admin-gesteuert`}>
          <div className="space-y-2.5">
            {manualTemplates.map((t) => {
              const info = TEMPLATE_LABELS[t] ?? { name: t, desc: "" };
              return (
                <div key={t} className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.01] px-3 py-2.5">
                  <Mail className="h-3.5 w-3.5 flex-shrink-0 text-gold-300/60" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-cream/80">{info.name}</p>
                    <p className="text-[10px] text-cream/35">{info.desc}</p>
                  </div>
                  <code className="flex-shrink-0 rounded bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-mono text-cream/30">{t}</code>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      {/* Cron-Emails */}
      <SectionLabel>Automatischer Versand (Cron)</SectionLabel>
      <Panel title="Cron-Job Statistiken" description="Emails die durch geplante Jobs versendet wurden" noPadding>
        {d.cronStats.length === 0 ? (
          <EmptyState icon={Clock} title="Noch keine Cron-Emails" description="Cron-Jobs versenden Emails automatisch (z.B. Warenkorb-Erinnerung, Webinar-Reminder)." />
        ) : (
          <DataTable columns={cronColumns} rows={d.cronStats} getRowKey={(r) => r.job} />
        )}
      </Panel>

      {d.cronStats.length > 0 && (
        <div className="mt-6">
          <Panel title="Versand nach Job-Typ">
            <FunnelBars data={d.cronStats.map((c) => ({ label: c.job, value: c.total }))} />
          </Panel>
        </div>
      )}

      {/* Broadcasts */}
      <SectionLabel>Broadcast-Historie</SectionLabel>
      <Panel title="Manuelle Broadcasts" description="Über den E-Mail-Composer versendete Kampagnen" noPadding>
        {d.recentBroadcasts.length === 0 ? (
          <EmptyState icon={Send} title="Noch keine Broadcasts" description="Broadcasts werden im E-Mail-Bereich erstellt und an Segmente versendet." />
        ) : (
          <DataTable columns={broadcastColumns} rows={d.recentBroadcasts} getRowKey={(r) => r.id} />
        )}
      </Panel>
    </div>
  );
}
