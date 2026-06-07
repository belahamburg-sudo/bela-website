"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  Search,
  ShoppingCart,
  CheckCircle2,
  Trash2,
  Eye,
} from "lucide-react";
import { Panel, AdminBadge, KeyValue } from "@/components/admin/ui";
import { DataTable, type Column } from "@/components/admin/data-table";
import { AdminButton } from "@/components/admin/admin-button";
import { Modal } from "@/components/admin/modal";
import { useToast } from "@/components/admin/toast";
import { formatEuro } from "@/lib/utils";
import { markPurchasePaid, deletePurchase } from "@/app/admin/verkaeufe/actions";

export type SaleRow = {
  id: string;
  courseSlug: string;
  email: string | null;
  amountTotal: number;
  currency: string | null;
  status: string;
  createdAt: string;
  stripeSessionId: string | null;
  stripeCustomerId: string | null;
  userId: string | null;
};

type StatusFilter = "all" | "paid" | "pending";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusLabel(status: string): string {
  if (status === "paid") return "Bezahlt";
  if (status === "pending") return "Offen";
  return status;
}

function downloadCsv(rows: SaleRow[]) {
  const header = ["Kurs", "Kunde", "Betrag (Cent)", "Währung", "Status", "Datum"];
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const lines = rows.map((r) =>
    [
      r.courseSlug,
      r.email ?? "",
      String(r.amountTotal),
      r.currency ?? "",
      statusLabel(r.status),
      r.createdAt,
    ]
      .map((cell) => escape(String(cell)))
      .join(",")
  );
  const csv = [header.map(escape).join(","), ...lines].join("\n");
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `verkaeufe-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Alle" },
  { value: "paid", label: "Bezahlt" },
  { value: "pending", label: "Offen" },
];

export function SalesTable({ rows }: { rows: SaleRow[] }) {
  const router = useRouter();
  const { success, error } = useToast();
  const [pending, startTransition] = useTransition();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState<SaleRow | null>(null);
  const [toDelete, setToDelete] = useState<SaleRow | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.courseSlug.toLowerCase().includes(q) ||
        (r.email ?? "").toLowerCase().includes(q)
      );
    });
  }, [rows, statusFilter, query]);

  function handleMarkPaid(row: SaleRow) {
    startTransition(async () => {
      const res = await markPurchasePaid(row.id);
      if (res.ok) {
        success("Verkauf als bezahlt markiert.");
        setDetail(null);
        router.refresh();
      } else {
        error(res.error ?? "Aktion fehlgeschlagen.");
      }
    });
  }

  function handleDelete() {
    if (!toDelete) return;
    const id = toDelete.id;
    startTransition(async () => {
      const res = await deletePurchase(id);
      if (res.ok) {
        success("Verkauf gelöscht.");
        setToDelete(null);
        setDetail(null);
        router.refresh();
      } else {
        error(res.error ?? "Löschen fehlgeschlagen.");
      }
    });
  }

  const columns: Column<SaleRow>[] = [
    {
      key: "courseSlug",
      header: "Kurs",
      render: (r) => <span className="font-medium text-cream/90">{r.courseSlug}</span>,
    },
    {
      key: "email",
      header: "Kunde",
      render: (r) => <span className="text-cream/70">{r.email ?? "—"}</span>,
    },
    {
      key: "amountTotal",
      header: "Betrag",
      align: "right",
      render: (r) => <span className="tabular-nums">{formatEuro(r.amountTotal)}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <AdminBadge tone={r.status === "paid" ? "green" : "amber"}>
          {statusLabel(r.status)}
        </AdminBadge>
      ),
    },
    {
      key: "createdAt",
      header: "Datum",
      align: "right",
      render: (r) => <span className="text-cream/50">{formatDate(r.createdAt)}</span>,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (r) => (
        <button
          onClick={() => setDetail(r)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-cream/50 transition-colors hover:border-gold-300/40 hover:text-gold-200"
        >
          <Eye className="h-3.5 w-3.5" />
          Details
        </button>
      ),
    },
  ];

  return (
    <>
      <Panel
        title="Transaktionen"
        description={`${filtered.length} von ${rows.length} Verkäufen`}
        noPadding
        actions={
          <AdminButton
            variant="secondary"
            size="sm"
            icon={Download}
            onClick={() => downloadCsv(filtered)}
            disabled={filtered.length === 0}
          >
            CSV exportieren
          </AdminButton>
        }
      >
        <div className="flex flex-col gap-3 border-b border-white/5 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={
                  statusFilter === f.value
                    ? "rounded-lg border border-gold-300/40 bg-gold-300/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gold-200"
                    : "rounded-lg border border-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-cream/40 transition-colors hover:border-white/20 hover:text-cream/70"
                }
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="relative sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-cream/30" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="E-Mail oder Kurs suchen…"
              className="w-full rounded-lg border border-white/10 bg-obsidian/60 py-2 pl-9 pr-3 text-sm text-cream placeholder:text-cream/30 focus:border-gold-300/40 focus:outline-none"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          rows={filtered}
          getRowKey={(r) => r.id}
          emptyIcon={ShoppingCart}
          emptyTitle="Keine Verkäufe gefunden"
          emptyDescription="Passe Filter oder Suche an."
        />
      </Panel>

      {/* Detail modal */}
      <Modal
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title="Verkaufsdetails"
        description={detail?.courseSlug}
        size="md"
        footer={
          detail ? (
            <>
              <AdminButton
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => setToDelete(detail)}
                disabled={pending}
              >
                Löschen
              </AdminButton>
              {detail.status !== "paid" && (
                <AdminButton
                  variant="primary"
                  size="sm"
                  icon={CheckCircle2}
                  onClick={() => handleMarkPaid(detail)}
                  loading={pending}
                >
                  Als bezahlt markieren
                </AdminButton>
              )}
            </>
          ) : null
        }
      >
        {detail && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <KeyValue label="Kurs">{detail.courseSlug}</KeyValue>
            <KeyValue label="Kunde">{detail.email ?? "—"}</KeyValue>
            <KeyValue label="Betrag">{formatEuro(detail.amountTotal)}</KeyValue>
            <KeyValue label="Währung">
              {detail.currency?.toUpperCase() ?? "—"}
            </KeyValue>
            <KeyValue label="Status">
              <AdminBadge tone={detail.status === "paid" ? "green" : "amber"}>
                {statusLabel(detail.status)}
              </AdminBadge>
            </KeyValue>
            <KeyValue label="Datum">{formatDate(detail.createdAt)}</KeyValue>
            <div className="sm:col-span-2">
              <KeyValue label="Stripe Session ID">
                <span className="break-all font-mono text-xs">
                  {detail.stripeSessionId ?? "—"}
                </span>
              </KeyValue>
            </div>
            <div className="sm:col-span-2">
              <KeyValue label="Stripe Customer ID">
                <span className="break-all font-mono text-xs">
                  {detail.stripeCustomerId ?? "—"}
                </span>
              </KeyValue>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        title="Verkauf löschen?"
        description="Diese Aktion kann nicht rückgängig gemacht werden."
        size="sm"
        footer={
          <>
            <AdminButton variant="ghost" size="sm" onClick={() => setToDelete(null)}>
              Abbrechen
            </AdminButton>
            <AdminButton
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={handleDelete}
              loading={pending}
            >
              Endgültig löschen
            </AdminButton>
          </>
        }
      >
        <p className="text-sm text-cream/70">
          Der Verkauf{" "}
          <span className="font-bold text-cream">{toDelete?.courseSlug}</span>
          {toDelete?.email ? (
            <>
              {" "}
              von <span className="font-bold text-cream">{toDelete.email}</span>
            </>
          ) : null}{" "}
          wird dauerhaft entfernt.
        </p>
      </Modal>
    </>
  );
}
