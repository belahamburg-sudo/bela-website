"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Power, type LucideIcon } from "lucide-react";
import { DataTable, type Column } from "@/components/admin/data-table";
import { AdminBadge } from "@/components/admin/ui";
import { AdminButton } from "@/components/admin/admin-button";
import { useToast } from "@/components/admin/toast";
import { updateTelegramStatus } from "@/app/admin/telegram/actions";

export type TelegramRow = {
  userId: string;
  email: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  status: string;
  currentPeriodEnd: string | null;
  createdAt: string | null;
};

/**
 * Null-safe date formatter. Returns "—" for missing values and for any string
 * that does not parse into a valid date, so a malformed row can never throw
 * during (server or client) render.
 */
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
    // Extremely defensive: fall back to ISO date if locale formatting fails.
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

function RowActions({ row }: { row: TelegramRow }) {
  const router = useRouter();
  const { success, error } = useToast();
  const [pending, startTransition] = useTransition();

  const isActive = row?.status === "active";
  const nextStatus: "active" | "inactive" = isActive ? "inactive" : "active";

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
            ? "Abo wurde aktiviert."
            : "Abo wurde deaktiviert."
        );
        router.refresh();
      } else {
        error(res.error ?? "Aktualisierung fehlgeschlagen.");
      }
    });
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <AdminButton
        size="sm"
        variant={isActive ? "danger" : "secondary"}
        icon={Power}
        onClick={toggle}
        loading={pending}
      >
        {isActive ? "Deaktivieren" : "Aktivieren"}
      </AdminButton>
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

export function TelegramTable({
  rows,
  emptyIcon,
}: {
  rows: TelegramRow[];
  emptyIcon?: LucideIcon;
}) {
  const safeRows = Array.isArray(rows) ? rows.filter(Boolean) : [];

  const [columns] = useState<Column<TelegramRow>[]>(() => [
    {
      key: "email",
      header: "E-Mail",
      render: (r) => (
        <span className="font-medium text-cream/90">
          {r?.email ?? <span className="text-cream/40">unbekannt</span>}
        </span>
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
      emptyIcon={emptyIcon}
      emptyTitle="Noch keine Abonnenten"
      emptyDescription="Sobald jemand ein Telegram-Abo abschließt, erscheint er hier."
    />
  );
}
