"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Pencil,
  Save,
  RotateCcw,
  Loader2,
  X,
  ChevronDown,
  ChevronRight,
  Send,
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

/**
 * "Bearbeiten" affordance for an email template. Opens a near-fullscreen editor:
 * left = editable fields (Betreff + a large body/HTML editor with helper text and
 * a collapsible "HTML (erweitert)" hint), right = a full-height LIVE preview
 * iframe. Two save modes:
 *   - "Nur für diesen Versand" OFF (default): "Speichern" persists an override
 *     via saveTemplateOverride.
 *   - "Nur für diesen Versand" ON: "Übernehmen" does NOT persist — it hands the
 *     edited { subject, html } back to the composer via onApplyOnce for the next
 *     send only.
 * "Auf Standard zurücksetzen" removes a stored override.
 *
 * The email templates are highly-styled HTML tables, so reliably extracting
 * structured text fields is impractical. We therefore keep a large monospace
 * HTML editor paired with the big live preview + clear helper text.
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
  const [html, setHtml] = useState("");
  const [isOverridden, setIsOverridden] = useState(false);

  // When ON, "Übernehmen" applies the edit to the next send only (no override).
  const [onceMode, setOnceMode] = useState(false);
  // Collapsible "HTML (erweitert)" hint for power users.
  const [advancedOpen, setAdvancedOpen] = useState(false);

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

  // Close on Escape (unless mid-save).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !saving && !resetting) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, saving, resetting]);

  const handleSave = () => {
    // One-time mode: hand the edited content back to the composer, don't persist.
    if (onceMode) {
      if (!html.trim()) {
        error("Der Inhalt darf nicht leer sein.");
        return;
      }
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

      {open && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6">
          <div
            onClick={() => {
              if (!busy) setOpen(false);
            }}
            className="fixed inset-0 bg-obsidian/80 backdrop-blur-sm"
          />
          <div className="relative z-10 flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink/95 shadow-soft backdrop-blur-xl">
            <header className="flex items-start justify-between gap-4 border-b border-white/5 px-6 py-4">
              <div className="min-w-0">
                <h2 className="text-lg font-extrabold tracking-tight text-cream">
                  Vorlage bearbeiten
                </h2>
                <p className="mt-1 truncate text-sm text-cream/40">
                  {isOverridden
                    ? `${template} — angepasst (überschreibt den Standard)`
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
              <div className="grid min-h-0 flex-1 gap-5 p-5 lg:grid-cols-2">
                {/* LEFT: editable fields */}
                <div className="flex min-h-0 flex-col gap-4 overflow-y-auto pr-1">
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
                      Inhalt
                    </label>
                    <p className="mb-1.5 text-xs text-cream/40">
                      Texte direkt im HTML anpassen. Platzhalter wie{" "}
                      <code className="rounded bg-white/5 px-1 text-gold-200">
                        {"{{name}}"}
                      </code>{" "}
                      und{" "}
                      <code className="rounded bg-white/5 px-1 text-gold-200">
                        {"{{email}}"}
                      </code>{" "}
                      werden beim Versand automatisch ersetzt. Die Vorschau rechts
                      aktualisiert sich live.
                    </p>
                    <textarea
                      id="te-html"
                      value={html}
                      onChange={(e) => setHtml(e.target.value)}
                      spellCheck={false}
                      className={`${INPUT_CLASS} min-h-[60vh] flex-1 resize-none font-mono text-xs leading-relaxed`}
                    />
                  </div>

                  {/* Collapsible power-user note. */}
                  <div className="rounded-lg border border-white/10 bg-ink/30">
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
                      <div className="border-t border-white/10 px-3 py-3 text-xs leading-relaxed text-cream/50">
                        Das Feld oben enthält das vollständige E-Mail-HTML
                        (Tabellen-Layout für E-Mail-Clients). Ändere nur die
                        sichtbaren Texte zwischen den Tags, wenn du dir unsicher
                        bist — Struktur und Inline-Styles bleiben am besten
                        unangetastet. Nutze die Live-Vorschau, um Änderungen sofort
                        zu prüfen.
                      </div>
                    )}
                  </div>

                  {/* One-time vs. persist toggle. */}
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/10 bg-ink/30 px-3 py-3">
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

                {/* RIGHT: live preview */}
                <div className="flex min-h-0 flex-col">
                  <span className={LABEL_CLASS}>Live-Vorschau</span>
                  <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-white/10 bg-white">
                    <iframe
                      srcDoc={html}
                      title="Vorlagen-Vorschau"
                      sandbox=""
                      className="h-full min-h-[60vh] w-full border-0"
                    />
                  </div>
                </div>
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
              <AdminButton
                variant="ghost"
                onClick={() => setOpen(false)}
                disabled={busy}
              >
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
