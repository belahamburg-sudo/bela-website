"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  Pencil,
  Save,
  RotateCcw,
  Loader2,
  X,
  ChevronDown,
  ChevronRight,
  Send,
  MousePointerClick,
} from "lucide-react";
import { AdminButton } from "@/components/admin/admin-button";
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

function withDoctype(html: string): string {
  return /^\s*<!doctype/i.test(html) ? html : `<!DOCTYPE html>\n${html}`;
}

/**
 * Visual ("WYSIWYG") editor for an email template. Instead of editing raw HTML,
 * the admin edits the rendered email DIRECTLY: the email is shown in an iframe
 * with designMode enabled, so clicking into any text and typing changes it. On
 * save we read the edited document back out. A collapsible "HTML (erweitert)"
 * stays available for power users.
 */
export function TemplateEditor({
  template,
  onSaved,
  onApplyOnce,
}: {
  template: EmailTemplate;
  onSaved?: () => void;
  onApplyOnce?: (content: { subject?: string; html: string }) => void;
}) {
  const { success, error } = useToast();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("");
  // The content loaded into the editable iframe. Replaced only on load / reset /
  // applying the advanced raw HTML — NOT on every keystroke (the iframe is the
  // live editing surface, so we don't want to reload it while typing).
  const [docHtml, setDocHtml] = useState("");
  const [iframeKey, setIframeKey] = useState(0);
  const [isOverridden, setIsOverridden] = useState(false);

  const [onceMode, setOnceMode] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [rawDraft, setRawDraft] = useState("");

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [saving, startSave] = useTransition();
  const [resetting, startReset] = useTransition();

  function loadContent(html: string, subj: string, overridden: boolean) {
    setSubject(subj);
    setDocHtml(html);
    setRawDraft(html);
    setIsOverridden(overridden);
    setIframeKey((k) => k + 1);
  }

  // Read the current (possibly edited) HTML back out of the editable iframe.
  function readIframeHtml(): string {
    try {
      const doc = iframeRef.current?.contentDocument;
      if (doc?.documentElement) return withDoctype(doc.documentElement.outerHTML);
    } catch {
      // cross-origin / not ready — fall back to last known content
    }
    return docHtml;
  }

  // Make the iframe editable once it has loaded.
  function handleIframeLoad() {
    try {
      const doc = iframeRef.current?.contentDocument;
      if (doc) doc.designMode = "on";
    } catch {
      // ignore — editing just won't be enabled, preview still shows
    }
  }

  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    getTemplateForEdit({ template })
      .then((res) => {
        if (!active) return;
        if (res.ok) {
          loadContent(res.html, res.subject, res.isOverridden);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, template]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !saving && !resetting) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, saving, resetting]);

  const handleSave = () => {
    const html = readIframeHtml();
    if (!html.trim()) {
      error("Der Inhalt darf nicht leer sein.");
      return;
    }
    if (onceMode) {
      onApplyOnce?.({ subject: subject.trim() || undefined, html });
      setOpen(false);
      return;
    }
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
        const fresh = await getTemplateForEdit({ template });
        if (fresh.ok) loadContent(fresh.html, fresh.subject, fresh.isOverridden);
        onSaved?.();
      } else {
        error(res.error ?? "Zurücksetzen fehlgeschlagen.");
      }
    });
  };

  const applyRaw = () => {
    setDocHtml(rawDraft);
    setIframeKey((k) => k + 1);
    success("HTML in die Vorschau übernommen.");
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

      {open && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6">
          <div
            onClick={() => {
              if (!busy) setOpen(false);
            }}
            className="fixed inset-0 bg-obsidian/80 backdrop-blur-sm"
          />
          <div className="relative z-10 flex h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink/95 shadow-soft backdrop-blur-xl">
            <header className="flex items-start justify-between gap-4 border-b border-white/5 px-6 py-4">
              <div className="min-w-0">
                <h2 className="text-lg font-extrabold tracking-tight text-cream">
                  Vorlage bearbeiten
                </h2>
                <p className="mt-1 truncate text-sm text-cream/40">
                  {isOverridden
                    ? `${template} — angepasst`
                    : `${template} — Standardinhalt`}
                </p>
              </div>
              <button
                onClick={() => {
                  if (!busy) setOpen(false);
                }}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-cream/40 transition-colors hover:bg-white/5 hover:text-cream"
                aria-label="Schließen"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            {loading ? (
              <div className="flex flex-1 items-center justify-center gap-2 text-sm text-cream/40">
                <Loader2 className="h-4 w-4 animate-spin" />
                Vorlage wird geladen …
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col gap-4 p-5">
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

                <div className="flex items-center gap-2 rounded-lg border border-gold-300/20 bg-gold-300/[0.04] px-3 py-2 text-xs text-cream/70">
                  <MousePointerClick className="h-3.5 w-3.5 flex-shrink-0 text-gold-300/70" />
                  <span>
                    Klick direkt in den Text und tippe, um ihn zu ändern.
                    Platzhalter wie{" "}
                    <code className="rounded bg-white/5 px-1 text-gold-200">{"{{name}}"}</code>{" "}
                    bleiben stehen und werden beim Versand automatisch ersetzt.
                  </span>
                </div>

                {/* Directly-editable email (WYSIWYG via designMode). */}
                <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-white/10 bg-white">
                  <iframe
                    key={iframeKey}
                    ref={iframeRef}
                    srcDoc={docHtml}
                    onLoad={handleIframeLoad}
                    title="E-Mail bearbeiten"
                    className="h-full w-full border-0"
                  />
                </div>

                {/* Advanced raw HTML for power users. */}
                <div className="flex-shrink-0 rounded-lg border border-white/10 bg-ink/30">
                  <button
                    type="button"
                    onClick={() => setAdvancedOpen((v) => !v)}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-bold text-cream/70 transition-colors hover:bg-white/[0.03]"
                    aria-expanded={advancedOpen}
                  >
                    {advancedOpen ? (
                      <ChevronDown className="h-4 w-4 text-gold-300/60" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gold-300/60" />
                    )}
                    HTML (erweitert)
                  </button>
                  {advancedOpen && (
                    <div className="space-y-2 border-t border-white/10 px-3 py-3">
                      <textarea
                        value={rawDraft}
                        onChange={(e) => setRawDraft(e.target.value)}
                        spellCheck={false}
                        className={`${INPUT_CLASS} h-40 resize-none font-mono text-xs leading-relaxed`}
                      />
                      <AdminButton variant="secondary" size="sm" onClick={applyRaw}>
                        HTML übernehmen
                      </AdminButton>
                    </div>
                  )}
                </div>

                <label className="flex flex-shrink-0 cursor-pointer items-start gap-3 rounded-lg border border-white/10 bg-ink/30 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={onceMode}
                    onChange={(e) => setOnceMode(e.target.checked)}
                    className="mt-0.5 h-4 w-4 flex-shrink-0 cursor-pointer rounded border-white/20 bg-ink/60 text-gold-400 accent-gold-400"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-cream/90">
                      Nur für diesen Versand
                    </span>
                    <span className="mt-0.5 block text-xs text-cream/50">
                      {onceMode
                        ? "Die Änderung wird NICHT dauerhaft gespeichert, sondern nur für den nächsten Versand verwendet."
                        : "Die Änderung wird als Vorlage gespeichert und für alle künftigen Versände genutzt."}
                    </span>
                  </span>
                </label>
              </div>
            )}

            <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-white/5 px-6 py-4">
              {isOverridden && !onceMode && (
                <AdminButton
                  variant="danger"
                  icon={RotateCcw}
                  onClick={handleReset}
                  loading={resetting}
                  disabled={busy}
                  className="mr-auto"
                >
                  Auf Standard zurücksetzen
                </AdminButton>
              )}
              <AdminButton variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
                Abbrechen
              </AdminButton>
              <AdminButton
                variant="primary"
                icon={onceMode ? Send : Save}
                onClick={handleSave}
                loading={saving}
                disabled={busy || loading}
              >
                {onceMode ? "Übernehmen" : "Speichern"}
              </AdminButton>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
