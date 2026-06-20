"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Power, Hash, Undo2, Pause, Link2, Link2Off } from "lucide-react";
import { DataTable, type Column } from "@/components/admin/data-table";
import { AdminBadge } from "@/components/admin/ui";
import { AdminButton } from "@/components/admin/admin-button";
import { useToast } from "@/components/admin/toast";
import { updateTelegramStatus, refundTelegramSubscription } from "@/app/admin/telegram/actions";

export type TelegramRow = {
  userId: string;
  email: string | null;
  name: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  status: string;
  currentPeriodEnd: string | null;
  createdAt: string | null;
  telegramUserId: number | null;
  telegramUsername: string | null;
  updatedAt: string | null;
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  try {
    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso.slice(0, 10);
  }
}

function truncateMiddle(
  value: string | null | undefined,
  head = 10,
  tail = 4
): string {
  if (!value) return "—";
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

function TelegramLinkBadge({ row }: { row: TelegramRow }) {
  if (row.telegramUserId) {
    return (
      <div className="flex flex-col gap-0.5">
        <span className="inline-flex items-center gap-1.5 text-emerald-300">
          <Link2 className="h-3 w-3" />
          <span className="text-xs">
            {row.telegramUsername ? `@${row.telegramUsername}` : `ID ${row.telegramUserId}`}
          </span>
        </span>
        <span className="font-mono text-[10px] text-cream/30">{row.telegramUserId}</span>
      </div>
    );
  }

  const isActive = row.status === "active";
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${isActive ? "text-amber-300" : "text-cream/30"}`}>
      <Link2Off className="h-3 w-3" />
      {isActive ? "fehlt" : "—"}
    </span>
  );
}

function RowActions({ row }: { row: TelegramRow }) {
  const router = useRouter();
  const { success, error } = useToast();
  const [pending, startTransition] = useTransition();
  const [refunding, startRefund] = useTransition();

  const isActive = row?.status === "active";
  const nextStatus: "active" | "inactive" = isActive ? "inactive" : "active";
  const hasStripe = Boolean(row?.stripeSubscriptionId || row?.stripeCustomerId);

  const toggle = () => {
    if (!row?.userId) {
      error("Diesem Eintrag fehlt eine Benutzer-ID.");
      return;
    }
    startTransition(async () => {
      const res = await updateTelegramStatus({ userId: row.userId, status: nextStatus });
      if (res.ok) {
        success(
          nextStatus === "active"
            ? "Zugang reaktiviert (entbannt)."
            : "Zugang pausiert (aus der VIP-Gruppe entfernt). Keine Rückzahlung."
        );
        router.refresh();
      } else {
        error(res.error ?? "Aktualisierung fehlgeschlagen.");
      }
    });
  };

  const refund = () => {
    if (!row?.userId) return;
    const ok = window.confirm(
      `Letzte VIP-Zahlung von ${row.email ?? "diesem Nutzer"} zurückerstatten, das Abo kündigen UND den Zugang entziehen? Das kann nicht rückgängig gemacht werden.`
    );
    if (!ok) return;
    startRefund(async () => {
      const res = await refundTelegramSubscription({ userId: row.userId });
      if (res.ok) {
        success("Zahlung erstattet, Abo gekündigt, Zugang entzogen.");
        router.refresh();
      } else {
        error(res.error ?? "Rückerstattung fehlgeschlagen.");
        router.refresh();
      }
    });
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <AdminButton
        size="sm"
        variant={isActive ? "danger" : "secondary"}
        icon={isActive ? Pause : Power}
        onClick={toggle}
        loading={pending}
      >
        {isActive ? "Pausieren" : "Reaktivieren"}
      </AdminButton>
      {hasStripe && (
        <AdminButton size="sm" variant="danger" icon={Undo2} onClick={refund} loading={refunding}>
          Refund
        </AdminButton>
      )}
      {row?.stripeCustomerId && (
        <a
          href={`https://dashboard.stripe.com/customers/${row.stripeCustomerId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-gold-300/25 bg-panel/60 px-3 text-[11px] font-bold uppercase tracking-wider text-cream transition-all hover:border-gold-300/60 hover:bg-gold-300/[0.06]"
          title="In Stripe öffnen"
        >
          Stripe
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
    </div>
  );
}

export function TelegramTable({ rows }: { rows: TelegramRow[] }) {
  const safeRows = Array.isArray(rows) ? rows.filter(Boolean) : [];

  const [columns] = useState<Column<TelegramRow>[]>(() => [
    {
      key: "email",
      header: "Nutzer",
      render: (r) => (
        <div className="flex flex-col">
          <span className="font-medium text-cream/90">
            {r?.email ?? <span className="text-cream/40">unbekannt</span>}
          </span>
          {r?.name && <span className="text-[11px] text-cream/40">{r.name}</span>}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => {
        const status = r?.status ?? "inactive";
        return (
          <AdminBadge tone={status === "active" ? "green" : "neutral"}>
            {status === "active" ? "Aktiv" : status || "—"}
          </AdminBadge>
        );
      },
    },
    {
      key: "telegram",
      header: "Telegram",
      render: (r) => <TelegramLinkBadge row={r} />,
    },
    {
      key: "stripeSubscriptionId",
      header: "Abo-ID",
      render: (r) => (
        <span className="font-mono text-xs text-cream/60">
          {truncateMiddle(r?.stripeSubscriptionId)}
        </span>
      ),
    },
    {
      key: "currentPeriodEnd",
      header: "Läuft bis",
      render: (r) => <span className="text-cream/60">{formatDate(r?.currentPeriodEnd)}</span>,
    },
    {
      key: "createdAt",
      header: "Seit",
      render: (r) => <span className="text-cream/60">{formatDate(r?.createdAt)}</span>,
    },
    {
      key: "actions",
      header: "Aktionen",
      align: "right",
      render: (r) => <RowActions row={r} />,
    },
  ]);

  return (
    <DataTable
      columns={columns}
      rows={safeRows}
      getRowKey={(r, i) => r?.userId ?? `row-${i}`}
      emptyIcon={Hash}
      emptyTitle="Noch keine Abonnenten"
      emptyDescription="Sobald jemand ein Telegram-Abo abschließt, erscheint er hier."
    />
  );
}
