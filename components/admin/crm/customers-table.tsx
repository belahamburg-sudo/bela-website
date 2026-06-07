"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Users,
  Eye,
  Unlock,
  Trash2,
  Send,
  GraduationCap,
} from "lucide-react";
import { Panel, AdminBadge, KeyValue, EmptyState } from "@/components/admin/ui";
import { DataTable, type Column } from "@/components/admin/data-table";
import { AdminButton } from "@/components/admin/admin-button";
import { Modal } from "@/components/admin/modal";
import { useToast } from "@/components/admin/toast";
import { formatEuro } from "@/lib/utils";
import {
  grantCourseAccess,
  revokeCourseAccess,
} from "@/app/admin/kunden/actions";

export type CustomerPurchase = {
  id: string;
  courseSlug: string;
  amountTotal: number;
  currency: string | null;
  status: string;
  createdAt: string;
};

export type CustomerRow = {
  id: string;
  email: string;
  fullName: string | null;
  city: string | null;
  goal: string | null;
  onboardingComplete: boolean;
  createdAt: string;
  paidCount: number;
  purchases: CustomerPurchase[];
  telegramStatus: string | null;
  telegramPeriodEnd: string | null;
};

export type CourseOption = {
  slug: string;
  title: string;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusLabel(status: string): string {
  if (status === "paid") return "Bezahlt";
  if (status === "pending") return "Offen";
  return status;
}

export function CustomersTable({
  rows,
  courseOptions,
}: {
  rows: CustomerRow[];
  courseOptions: CourseOption[];
}) {
  const router = useRouter();
  const { success, error } = useToast();
  const [pending, startTransition] = useTransition();

  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState<CustomerRow | null>(null);
  const [selectedCourse, setSelectedCourse] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.email.toLowerCase().includes(q) ||
        (r.fullName ?? "").toLowerCase().includes(q) ||
        (r.city ?? "").toLowerCase().includes(q)
    );
  }, [rows, query]);

  // keep the open detail in sync with refreshed server data
  const activeDetail = useMemo(() => {
    if (!detail) return null;
    return rows.find((r) => r.id === detail.id) ?? detail;
  }, [detail, rows]);

  const unlockedSlugs = useMemo(
    () =>
      new Set(
        (activeDetail?.purchases ?? [])
          .filter((p) => p.status === "paid")
          .map((p) => p.courseSlug)
      ),
    [activeDetail]
  );

  const availableCourses = useMemo(
    () => courseOptions.filter((c) => !unlockedSlugs.has(c.slug)),
    [courseOptions, unlockedSlugs]
  );

  function openDetail(row: CustomerRow) {
    setDetail(row);
    setSelectedCourse("");
  }

  function handleGrant() {
    if (!activeDetail || !selectedCourse) return;
    const userId = activeDetail.id;
    startTransition(async () => {
      const res = await grantCourseAccess({ userId, courseSlug: selectedCourse });
      if (res.ok) {
        success("Kurs freigeschaltet.");
        setSelectedCourse("");
        router.refresh();
      } else {
        error(res.error ?? "Freischalten fehlgeschlagen.");
      }
    });
  }

  function handleRevoke(purchaseId: string) {
    startTransition(async () => {
      const res = await revokeCourseAccess({ purchaseId });
      if (res.ok) {
        success("Zugriff entfernt.");
        router.refresh();
      } else {
        error(res.error ?? "Entfernen fehlgeschlagen.");
      }
    });
  }

  const columns: Column<CustomerRow>[] = [
    {
      key: "email",
      header: "E-Mail",
      render: (r) => <span className="font-medium text-cream/90">{r.email}</span>,
    },
    {
      key: "fullName",
      header: "Name",
      render: (r) => <span className="text-cream/70">{r.fullName ?? "—"}</span>,
    },
    {
      key: "city",
      header: "Stadt",
      render: (r) => <span className="text-cream/70">{r.city ?? "—"}</span>,
    },
    {
      key: "paidCount",
      header: "Käufe",
      align: "center",
      render: (r) =>
        r.paidCount > 0 ? (
          <AdminBadge tone="gold">{r.paidCount}</AdminBadge>
        ) : (
          <span className="text-cream/30">0</span>
        ),
    },
    {
      key: "createdAt",
      header: "Beigetreten",
      align: "right",
      render: (r) => <span className="text-cream/50">{formatDate(r.createdAt)}</span>,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (r) => (
        <button
          onClick={() => openDetail(r)}
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
        title="Alle Kunden"
        description={`${filtered.length} von ${rows.length} Mitgliedern`}
        noPadding
      >
        <div className="border-b border-white/5 px-5 py-4">
          <div className="relative sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-cream/30" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="E-Mail, Name oder Stadt suchen…"
              className="w-full rounded-lg border border-white/10 bg-obsidian/60 py-2 pl-9 pr-3 text-sm text-cream placeholder:text-cream/30 focus:border-gold-300/40 focus:outline-none"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          rows={filtered}
          getRowKey={(r) => r.id}
          emptyIcon={Users}
          emptyTitle="Keine Kunden gefunden"
          emptyDescription="Passe die Suche an."
        />
      </Panel>

      {/* Customer detail modal */}
      <Modal
        open={Boolean(activeDetail)}
        onClose={() => setDetail(null)}
        title={activeDetail?.fullName || activeDetail?.email || "Kunde"}
        description={activeDetail?.email}
        size="lg"
      >
        {activeDetail && (
          <div className="flex flex-col gap-6">
            {/* Profile fields */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <KeyValue label="E-Mail">{activeDetail.email}</KeyValue>
              <KeyValue label="Name">{activeDetail.fullName ?? "—"}</KeyValue>
              <KeyValue label="Stadt">{activeDetail.city ?? "—"}</KeyValue>
              <KeyValue label="Ziel">{activeDetail.goal ?? "—"}</KeyValue>
              <KeyValue label="Onboarding">
                <AdminBadge tone={activeDetail.onboardingComplete ? "green" : "neutral"}>
                  {activeDetail.onboardingComplete ? "Abgeschlossen" : "Offen"}
                </AdminBadge>
              </KeyValue>
              <KeyValue label="Beigetreten">
                {formatDate(activeDetail.createdAt)}
              </KeyValue>
            </div>

            {/* Telegram status */}
            <div className="rounded-xl border border-white/10 bg-panel/40 p-4">
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4 text-gold-300/60" />
                <span className="tac-label">Telegram</span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                {activeDetail.telegramStatus ? (
                  <AdminBadge
                    tone={activeDetail.telegramStatus === "active" ? "green" : "amber"}
                  >
                    {activeDetail.telegramStatus}
                  </AdminBadge>
                ) : (
                  <span className="text-sm text-cream/40">Kein Abo</span>
                )}
                {activeDetail.telegramPeriodEnd && (
                  <span className="text-xs text-cream/40">
                    läuft bis {formatDate(activeDetail.telegramPeriodEnd)}
                  </span>
                )}
              </div>
            </div>

            {/* Manual course unlock */}
            <div className="rounded-xl border border-gold-300/20 bg-gold-300/[0.03] p-4">
              <div className="flex items-center gap-2">
                <Unlock className="h-4 w-4 text-gold-300/70" />
                <span className="tac-label text-gold-200/70">
                  Kurs manuell freischalten
                </span>
              </div>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  disabled={availableCourses.length === 0 || pending}
                  className="w-full rounded-lg border border-white/10 bg-obsidian/60 px-3 py-2 text-sm text-cream focus:border-gold-300/40 focus:outline-none disabled:opacity-50"
                >
                  <option value="" className="bg-ink text-cream">
                    {availableCourses.length === 0
                      ? "Alle Kurse freigeschaltet"
                      : "Kurs auswählen…"}
                  </option>
                  {availableCourses.map((c) => (
                    <option key={c.slug} value={c.slug} className="bg-ink text-cream">
                      {c.title}
                    </option>
                  ))}
                </select>
                <AdminButton
                  variant="primary"
                  size="md"
                  icon={Unlock}
                  onClick={handleGrant}
                  loading={pending}
                  disabled={!selectedCourse}
                >
                  Freischalten
                </AdminButton>
              </div>
            </div>

            {/* Purchases / unlocked courses */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-gold-300/60" />
                <span className="tac-label">Käufe &amp; freigeschaltete Kurse</span>
              </div>
              {activeDetail.purchases.length === 0 ? (
                <EmptyState
                  icon={GraduationCap}
                  title="Noch keine Käufe"
                  description="Schalte oben einen Kurs frei."
                />
              ) : (
                <div className="flex flex-col divide-y divide-white/5 rounded-xl border border-white/10">
                  {activeDetail.purchases.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-3 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-cream/90">
                          {p.courseSlug}
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-cream/40">
                          <AdminBadge tone={p.status === "paid" ? "green" : "amber"}>
                            {statusLabel(p.status)}
                          </AdminBadge>
                          <span>{formatEuro(p.amountTotal)}</span>
                          <span>{formatDate(p.createdAt)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRevoke(p.id)}
                        disabled={pending}
                        className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-cream/40 transition-colors hover:border-red-500/40 hover:text-red-300 disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Entfernen
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
