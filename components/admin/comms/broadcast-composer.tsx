"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Send,
  MailCheck,
  Users,
  Loader2,
  Eye,
  ChevronDown,
  ChevronRight,
  Trash2,
  X,
  Pencil,
} from "lucide-react";
import { Panel, KeyValue, EmptyState } from "@/components/admin/ui";
import { AdminButton } from "@/components/admin/admin-button";
import { Modal } from "@/components/admin/modal";
import { TemplateEditor } from "@/components/admin/comms/template-editor";
import { useToast } from "@/components/admin/toast";
import type { EmailTemplate } from "@/lib/email";
import {
  previewSegment,
  previewTemplate,
  resolveRecipients,
  sendBroadcast,
  sendToOne,
  removeRecipient,
  sendTestEmail,
  type Recipient,
} from "@/app/admin/emails/actions";
import { SEGMENT_LABELS, type Segment } from "@/app/admin/emails/segments";

const TEMPLATES: EmailTemplate[] = [
  "change-email",
  "checkout-abandoned",
  "course-completed",
  "course-unlocked",
  "invite-user",
  "magic-link",
  "newsletter-double-opt-in",
  "newsletter-unsubscribe-confirmed",
  "newsletter-welcome",
  "onboarding-complete",
  "password-reset",
  "payment-failed",
  "purchase-confirmation",
  "re-engagement",
  "reauthentication",
  "signup-confirmation",
  "support-ticket-received",
  "telegram-free-welcome",
  "telegram-paid-welcome",
  "webinar-registration-confirmed",
  "webinar-reminder-1h",
  "webinar-reminder-24h",
];

// Suggested templates for broadcasts, surfaced first in the list.
const SUGGESTED: EmailTemplate[] = [
  "newsletter-welcome",
  "re-engagement",
  "webinar-reminder-24h",
  "webinar-reminder-1h",
];

const SEGMENTS = Object.keys(SEGMENT_LABELS) as Segment[];

const SELECT_CLASS =
  "w-full rounded-lg border border-white/10 bg-ink/60 px-3 py-2.5 text-sm text-cream/90 outline-none transition-colors focus:border-gold-300/40 focus:ring-1 focus:ring-gold-300/20";

const LABEL_CLASS = "tac-label mb-1.5 block";

export function BroadcastComposer() {
  const router = useRouter();
  const { success, error } = useToast();

  const [template, setTemplate] = useState<EmailTemplate>("newsletter-welcome");
  const [subject, setSubject] = useState("");
  const [segment, setSegment] = useState<Segment>("all_members");

  const [count, setCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [testing, startTest] = useTransition();
  const [sending, startSend] = useTransition();

  // Template preview (rendered HTML in a near-fullscreen overlay).
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [preview, setPreview] = useState<{ html: string; subject: string } | null>(null);

  // One-time edit applied to the NEXT send only (does not persist an override).
  const [oneTime, setOneTime] = useState<{ subject?: string; html: string } | null>(
    null
  );

  // Collapsible recipient list (lazy-loaded per segment).
  const [listOpen, setListOpen] = useState(false);
  const [recipients, setRecipients] = useState<Recipient[] | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  // Emails excluded from this batch (kept, but skipped on send).
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  // Email currently being acted on (single send / remove), for per-row spinners.
  const [busyEmail, setBusyEmail] = useState<string | null>(null);
  const [, startRowAction] = useTransition();

  // A one-time edit is tied to a specific template; drop it if the template
  // selection changes so we never send stale content for the wrong template.
  useEffect(() => {
    setOneTime(null);
  }, [template]);

  // Close the preview overlay on Escape.
  useEffect(() => {
    if (!previewOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreviewOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [previewOpen]);

  // Refresh the live recipient-count preview whenever the segment changes, and
  // reset the (now-stale) recipient list + exclusions for the new segment.
  useEffect(() => {
    let active = true;
    setLoadingCount(true);
    setCount(null);
    setRecipients(null);
    setExcluded(new Set());
    setListOpen(false);
    previewSegment(segment)
      .then((res) => {
        if (active) setCount(res.count);
      })
      .catch(() => {
        if (active) setCount(null);
      })
      .finally(() => {
        if (active) setLoadingCount(false);
      });
    return () => {
      active = false;
    };
  }, [segment]);

  // Lazy-load the recipient list the first time the section is expanded.
  const loadRecipients = () => {
    if (recipients !== null || loadingList) return;
    setLoadingList(true);
    resolveRecipients(segment)
      .then((res) => {
        if (res.ok) setRecipients(res.recipients);
        else {
          error(res.error);
          setRecipients([]);
        }
      })
      .catch(() => {
        error("Empfänger konnten nicht geladen werden.");
        setRecipients([]);
      })
      .finally(() => setLoadingList(false));
  };

  const toggleList = () => {
    const next = !listOpen;
    setListOpen(next);
    if (next) loadRecipients();
  };

  const toggleExclude = (email: string) => {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
  };

  const handlePreview = () => {
    setPreviewOpen(true);
    setPreviewLoading(true);
    setPreview(null);
    // If a one-time edit is active, preview that exact content instead of the
    // stored/default template so the admin sees what will actually be sent.
    if (oneTime) {
      setPreview({
        html: oneTime.html,
        subject: oneTime.subject?.trim() || subject.trim() || "(Standard-Betreff)",
      });
      setPreviewLoading(false);
      return;
    }
    previewTemplate(template)
      .then((res) => {
        if (res.ok) setPreview({ html: res.html, subject: res.subject });
        else {
          error(res.error);
          setPreviewOpen(false);
        }
      })
      .catch(() => {
        error("Vorschau konnte nicht geladen werden.");
        setPreviewOpen(false);
      })
      .finally(() => setPreviewLoading(false));
  };

  const handleSendOne = (r: Recipient) => {
    setBusyEmail(r.email);
    startRowAction(async () => {
      const res = await sendToOne({
        template,
        email: r.email,
        name: r.name,
        subject,
        oneTimeHtml: oneTime?.html,
        oneTimeSubject: oneTime?.subject,
      });
      if (res.ok) success(`E-Mail an ${r.email} versendet.`);
      else error(res.error ?? "Versand fehlgeschlagen.");
      setBusyEmail(null);
    });
  };

  const handleRemove = (r: Recipient) => {
    setBusyEmail(r.email);
    startRowAction(async () => {
      const res = await removeRecipient({ email: r.email, segment });
      if (res.ok) {
        setRecipients((prev) => (prev ? prev.filter((x) => x.email !== r.email) : prev));
        setExcluded((prev) => {
          const next = new Set(prev);
          next.delete(r.email);
          return next;
        });
        setCount((c) => (typeof c === "number" ? Math.max(0, c - 1) : c));
        success(`${r.email} entfernt.`);
      } else {
        error(res.error ?? "Entfernen fehlgeschlagen.");
      }
      setBusyEmail(null);
    });
  };

  const handleTest = () => {
    startTest(async () => {
      const res = await sendTestEmail({
        template,
        subject,
        oneTimeHtml: oneTime?.html,
        oneTimeSubject: oneTime?.subject,
      });
      if (res.ok) success("Test-E-Mail an dich versendet.");
      else error(res.error ?? "Test fehlgeschlagen.");
    });
  };

  const handleSend = () => {
    startSend(async () => {
      const res = await sendBroadcast({
        template,
        subject,
        segment,
        exclude: Array.from(excluded),
        oneTimeHtml: oneTime?.html,
        oneTimeSubject: oneTime?.subject,
      });
      if (res.ok) {
        success("Broadcast wurde versendet.");
        setConfirmOpen(false);
        setSubject("");
        setExcluded(new Set());
        setOneTime(null);
        router.refresh();
      } else {
        error(res.error ?? "Versand fehlgeschlagen.");
      }
    });
  };

  // Effective number of recipients for this batch (total minus exclusions).
  const effectiveCount =
    typeof count === "number" ? Math.max(0, count - excluded.size) : null;

  return (
    <Panel
      title="Neuer Broadcast"
      description="Wähle Vorlage und Zielgruppe, teste den Versand und sende an alle Empfänger."
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <label className={LABEL_CLASS} htmlFor="bc-template">
            Template
          </label>
          <div className="flex items-center gap-2">
            <select
              id="bc-template"
              value={template}
              onChange={(e) => setTemplate(e.target.value as EmailTemplate)}
              className={SELECT_CLASS}
            >
              <optgroup label="Empfohlen">
                {SUGGESTED.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Alle Vorlagen">
                {TEMPLATES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </optgroup>
            </select>
            <AdminButton
              variant="secondary"
              icon={Eye}
              onClick={handlePreview}
              className="flex-shrink-0"
            >
              Vorschau
            </AdminButton>
            <TemplateEditor
              template={template}
              onSaved={() => router.refresh()}
              onApplyOnce={(content) => {
                setOneTime(content);
                success("Einmalige Bearbeitung für den nächsten Versand übernommen.");
              }}
            />
          </div>

          {oneTime && (
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-xs font-bold text-amber-200">
                <Pencil className="h-3 w-3" />
                Einmalige Bearbeitung aktiv
              </span>
              <button
                type="button"
                onClick={() => setOneTime(null)}
                className="inline-flex items-center gap-1 text-xs text-cream/50 transition-colors hover:text-cream/80"
                title="Einmalige Bearbeitung verwerfen"
              >
                <X className="h-3 w-3" />
                Verwerfen
              </button>
            </div>
          )}
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="bc-segment">
            Segment
          </label>
          <select
            id="bc-segment"
            value={segment}
            onChange={(e) => setSegment(e.target.value as Segment)}
            className={SELECT_CLASS}
          >
            {SEGMENTS.map((s) => (
              <option key={s} value={s}>
                {SEGMENT_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-2">
          <label className={LABEL_CLASS} htmlFor="bc-subject">
            Betreff (optional)
          </label>
          <input
            id="bc-subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Leer lassen, um den Standard-Betreff der Vorlage zu nutzen"
            className={SELECT_CLASS}
          />
        </div>
      </div>

      {/* Collapsible recipient list with per-person actions. */}
      <div className="mt-5 overflow-hidden rounded-lg border border-white/10 bg-ink/30">
        <button
          type="button"
          onClick={toggleList}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.03]"
          aria-expanded={listOpen}
        >
          <span className="flex items-center gap-2 text-sm font-bold text-cream/80">
            {listOpen ? (
              <ChevronDown className="h-4 w-4 text-gold-300/60" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gold-300/60" />
            )}
            Empfänger ({count ?? 0})
          </span>
          {excluded.size > 0 && (
            <span className="text-xs font-medium text-amber-300/90">
              {excluded.size} ausgeschlossen
            </span>
          )}
        </button>

        {listOpen && (
          <div className="border-t border-white/10">
            {loadingList ? (
              <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-cream/40">
                <Loader2 className="h-4 w-4 animate-spin" />
                Empfänger werden geladen …
              </div>
            ) : recipients && recipients.length > 0 ? (
              <ul className="max-h-80 divide-y divide-white/5 overflow-y-auto">
                {recipients.map((r) => {
                  const isExcluded = excluded.has(r.email);
                  const rowBusy = busyEmail === r.email;
                  return (
                    <li
                      key={r.email}
                      className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
                        isExcluded ? "opacity-50" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={!isExcluded}
                        onChange={() => toggleExclude(r.email)}
                        title={
                          isExcluded
                            ? "In diesen Versand aufnehmen"
                            : "Von diesem Versand ausschließen"
                        }
                        className="h-4 w-4 flex-shrink-0 cursor-pointer rounded border-white/20 bg-ink/60 text-gold-400 accent-gold-400"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-cream/90">
                          {r.name || <span className="text-cream/40">(Kein Name)</span>}
                        </p>
                        <p className="truncate font-mono text-xs text-cream/50">{r.email}</p>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-1.5">
                        <AdminButton
                          variant="secondary"
                          size="sm"
                          icon={Send}
                          onClick={() => handleSendOne(r)}
                          loading={rowBusy}
                          disabled={busyEmail !== null && !rowBusy}
                        >
                          Einzeln senden
                        </AdminButton>
                        <AdminButton
                          variant="danger"
                          size="sm"
                          icon={Trash2}
                          onClick={() => handleRemove(r)}
                          loading={rowBusy}
                          disabled={busyEmail !== null && !rowBusy}
                        >
                          Entfernen
                        </AdminButton>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState
                icon={Users}
                title="Keine Empfänger"
                description="Für dieses Segment gibt es aktuell keine Empfänger."
              />
            )}
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-4 border-t border-white/5 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-cream/70">
          <Users className="h-4 w-4 text-gold-300/50" />
          <span>Empfänger:</span>
          {loadingCount ? (
            <Loader2 className="h-4 w-4 animate-spin text-cream/40" />
          ) : (
            <span className="font-bold text-cream">
              {effectiveCount ?? 0}
              {excluded.size > 0 && (
                <span className="ml-1 font-normal text-cream/40">
                  von {count ?? 0}
                </span>
              )}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <AdminButton
            variant="secondary"
            icon={MailCheck}
            onClick={handleTest}
            loading={testing}
            disabled={sending}
          >
            Test an mich
          </AdminButton>
          <AdminButton
            variant="primary"
            icon={Send}
            onClick={() => setConfirmOpen(true)}
            disabled={testing || sending || !effectiveCount}
          >
            Senden
          </AdminButton>
        </div>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => {
          if (!sending) setConfirmOpen(false);
        }}
        title="Broadcast versenden?"
        description="Diese Aktion versendet E-Mails an alle nicht ausgeschlossenen Empfänger des Segments."
        footer={
          <>
            <AdminButton
              variant="ghost"
              onClick={() => setConfirmOpen(false)}
              disabled={sending}
            >
              Abbrechen
            </AdminButton>
            <AdminButton
              variant="primary"
              icon={Send}
              onClick={handleSend}
              loading={sending}
            >
              Jetzt senden
            </AdminButton>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <KeyValue label="Template">
            <span className="font-mono text-xs">{template}</span>
          </KeyValue>
          <KeyValue label="Segment">{SEGMENT_LABELS[segment]}</KeyValue>
          <KeyValue label="Betreff">
            {subject.trim() || <span className="text-cream/40">(Standard-Betreff)</span>}
          </KeyValue>
          <KeyValue label="Empfänger">
            <span className="font-bold text-gold-200">{effectiveCount ?? 0}</span>
            {excluded.size > 0 && (
              <span className="ml-1 text-xs font-normal text-cream/40">
                ({excluded.size} ausgeschlossen)
              </span>
            )}
          </KeyValue>
        </div>
      </Modal>

      {/* Near-fullscreen preview overlay — shows the WHOLE email comfortably. */}
      {previewOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6">
          <div
            onClick={() => setPreviewOpen(false)}
            className="fixed inset-0 bg-obsidian/80 backdrop-blur-sm"
          />
          <div className="relative z-10 flex h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink/95 shadow-soft backdrop-blur-xl">
            <header className="flex items-start justify-between gap-4 border-b border-white/5 px-6 py-4">
              <div className="min-w-0">
                <h2 className="text-lg font-extrabold tracking-tight text-cream">
                  Template-Vorschau
                </h2>
                <p className="mt-1 truncate text-sm text-cream/40">
                  {preview ? `Betreff: ${preview.subject}` : "Vorlage wird gerendert …"}
                </p>
              </div>
              <button
                onClick={() => setPreviewOpen(false)}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-cream/40 transition-colors hover:bg-white/5 hover:text-cream"
                aria-label="Schließen"
              >
                <X className="h-4 w-4" />
              </button>
            </header>
            <div className="flex min-h-0 flex-1 flex-col p-4">
              {previewLoading || !preview ? (
                <div className="flex flex-1 items-center justify-center gap-2 text-sm text-cream/40">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Vorschau wird geladen …
                </div>
              ) : (
                <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-white/10 bg-white">
                  <iframe
                    srcDoc={preview.html}
                    title="E-Mail-Vorschau"
                    sandbox=""
                    className="h-full w-full border-0"
                    scrolling="yes"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
}
