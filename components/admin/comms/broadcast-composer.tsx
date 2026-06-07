"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send, MailCheck, Users, Loader2 } from "lucide-react";
import { Panel, KeyValue } from "@/components/admin/ui";
import { AdminButton } from "@/components/admin/admin-button";
import { Modal } from "@/components/admin/modal";
import { useToast } from "@/components/admin/toast";
import type { EmailTemplate } from "@/lib/email";
import { previewSegment, sendBroadcast, sendTestEmail } from "@/app/admin/emails/actions";
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

  // Refresh the live recipient-count preview whenever the segment changes.
  useEffect(() => {
    let active = true;
    setLoadingCount(true);
    setCount(null);
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

  const handleTest = () => {
    startTest(async () => {
      const res = await sendTestEmail({ template, subject });
      if (res.ok) success("Test-E-Mail an dich versendet.");
      else error(res.error ?? "Test fehlgeschlagen.");
    });
  };

  const handleSend = () => {
    startSend(async () => {
      const res = await sendBroadcast({ template, subject, segment });
      if (res.ok) {
        success("Broadcast wurde versendet.");
        setConfirmOpen(false);
        setSubject("");
        router.refresh();
      } else {
        error(res.error ?? "Versand fehlgeschlagen.");
      }
    });
  };

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

      <div className="mt-5 flex flex-col gap-4 border-t border-white/5 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-cream/70">
          <Users className="h-4 w-4 text-gold-300/50" />
          <span>Empfänger:</span>
          {loadingCount ? (
            <Loader2 className="h-4 w-4 animate-spin text-cream/40" />
          ) : (
            <span className="font-bold text-cream">
              {count ?? 0} {count === 1 ? "Empfänger" : "Empfänger"}
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
            disabled={testing || sending || !count}
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
        description="Diese Aktion versendet E-Mails an alle Empfänger des Segments."
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
            <span className="font-bold text-gold-200">{count ?? 0}</span>
          </KeyValue>
        </div>
      </Modal>
    </Panel>
  );
}
