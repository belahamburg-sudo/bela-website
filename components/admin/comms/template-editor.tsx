"use client";

import { useEffect, useState, useTransition } from "react";
import { Pencil, Save, RotateCcw, Loader2 } from "lucide-react";
import { AdminButton } from "@/components/admin/admin-button";
import { Modal } from "@/components/admin/modal";
import { useToast } from "@/components/admin/toast";
import type { EmailTemplate } from "@/lib/email";
import {
  getTemplateForEdit,
  saveTemplateOverride,
  resetTemplateOverride,
} from "@/app/admin/emails/actions";

const INPUT_CLASS =
  "w-full rounded-lg border border-white/10 bg-ink/60 px-3 py-2.5 text-sm text-cream/90 outline-none transition-colors focus:border-gold-300/40 focus:ring-1 focus:ring-gold-300/20";

const LABEL_CLASS = "tac-label mb-1.5 block";

/**
 * "Bearbeiten" affordance for an email template. Opens a large modal with a
 * subject input + a big HTML textarea (prefilled with the effective template)
 * and a live-ish iframe preview. Admins can save an override or reset to the
 * default file-based content. State refreshes whenever the selected template or
 * `open` changes.
 */
export function TemplateEditor({
  template,
  onSaved,
}: {
  template: EmailTemplate;
  onSaved?: () => void;
}) {
  const { success, error } = useToast();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [isOverridden, setIsOverridden] = useState(false);

  const [saving, startSave] = useTransition();
  const [resetting, startReset] = useTransition();

  // (Re)load the effective template whenever the editor opens or the template
  // selection changes while it is open.
  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    getTemplateForEdit({ template })
      .then((res) => {
        if (!active) return;
        if (res.ok) {
          setSubject(res.subject);
          setHtml(res.html);
          setIsOverridden(res.isOverridden);
        } else {
          error(res.error);
          setOpen(false);
        }
      })
      .catch(() => {
        if (!active) return;
        error("Vorlage konnte nicht geladen werden.");
        setOpen(false);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [open, template, error]);

  const handleSave = () => {
    startSave(async () => {
      const res = await saveTemplateOverride({ template, subject, html });
      if (res.ok) {
        success("Vorlage gespeichert.");
        setIsOverridden(true);
        onSaved?.();
        setOpen(false);
      } else {
        error(res.error ?? "Speichern fehlgeschlagen.");
      }
    });
  };

  const handleReset = () => {
    startReset(async () => {
      const res = await resetTemplateOverride({ template });
      if (res.ok) {
        success("Auf Standard zurückgesetzt.");
        // Reload the default content into the editor.
        const fresh = await getTemplateForEdit({ template });
        if (fresh.ok) {
          setSubject(fresh.subject);
          setHtml(fresh.html);
          setIsOverridden(fresh.isOverridden);
        }
        onSaved?.();
      } else {
        error(res.error ?? "Zurücksetzen fehlgeschlagen.");
      }
    });
  };

  const busy = saving || resetting;

  return (
    <>
      <AdminButton
        variant="secondary"
        icon={Pencil}
        onClick={() => setOpen(true)}
        className="flex-shrink-0"
      >
        Bearbeiten
      </AdminButton>

      <Modal
        open={open}
        onClose={() => {
          if (!busy) setOpen(false);
        }}
        title="Vorlage bearbeiten"
        description={
          isOverridden
            ? `${template} — angepasst (überschreibt den Standard)`
            : `${template} — Standardinhalt`
        }
        size="lg"
        footer={
          <>
            {isOverridden && (
              <AdminButton
                variant="danger"
                icon={RotateCcw}
                onClick={handleReset}
                loading={resetting}
                disabled={busy}
              >
                Auf Standard zurücksetzen
              </AdminButton>
            )}
            <AdminButton
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={busy}
            >
              Abbrechen
            </AdminButton>
            <AdminButton
              variant="primary"
              icon={Save}
              onClick={handleSave}
              loading={saving}
              disabled={busy || loading}
            >
              Speichern
            </AdminButton>
          </>
        }
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-cream/40">
            <Loader2 className="h-4 w-4 animate-spin" />
            Vorlage wird geladen …
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              <div>
                <label className={LABEL_CLASS} htmlFor="te-subject">
                  Betreff
                </label>
                <input
                  id="te-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Betreff der Vorlage"
                  className={INPUT_CLASS}
                />
              </div>
              <div className="flex min-h-0 flex-1 flex-col">
                <label className={LABEL_CLASS} htmlFor="te-html">
                  HTML-Inhalt
                </label>
                <textarea
                  id="te-html"
                  value={html}
                  onChange={(e) => setHtml(e.target.value)}
                  spellCheck={false}
                  className={`${INPUT_CLASS} h-[60vh] resize-none font-mono text-xs leading-relaxed`}
                />
              </div>
            </div>

            <div className="flex flex-col">
              <span className={LABEL_CLASS}>Live-Vorschau</span>
              <div className="overflow-hidden rounded-lg border border-white/10 bg-white">
                <iframe
                  srcDoc={html}
                  title="Vorlagen-Vorschau"
                  sandbox=""
                  className="h-[60vh] w-full border-0"
                />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
