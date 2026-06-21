"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  HelpCircle,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { AdminButton } from "@/components/admin/admin-button";
import { Modal } from "@/components/admin/modal";
import { useToast } from "@/components/admin/toast";
import {
  saveQuizQuestion,
  deleteQuizQuestion,
  reorderQuizQuestions,
} from "@/app/admin/kurse/quiz-actions";

type QuizOption = { text: string; isCorrect: boolean };
type QuizQuestion = {
  id: string;
  question: string;
  options: QuizOption[];
  explanation: string | null;
  position: number;
};

const inputClass =
  "w-full rounded-lg border border-white/10 bg-obsidian/60 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-300/40 focus:outline-none";

const EMPTY_OPTION: QuizOption = { text: "", isCorrect: false };

function makeEmptyOptions(): QuizOption[] {
  return [
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
  ];
}

export function QuizEditor({
  moduleId,
  moduleName,
  questions: initialQuestions,
}: {
  moduleId: string;
  moduleName: string;
  questions: QuizQuestion[];
}) {
  const router = useRouter();
  const { success, error } = useToast();
  const [pending, startTransition] = useTransition();
  const [questions, setQuestions] = useState(initialQuestions);

  // Keep in sync when parent re-renders with new data.
  useEffect(() => {
    setQuestions(initialQuestions);
  }, [initialQuestions]);

  // ── Form state ──
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formQuestion, setFormQuestion] = useState("");
  const [formOptions, setFormOptions] = useState<QuizOption[]>(makeEmptyOptions());
  const [formExplanation, setFormExplanation] = useState("");

  // ── Delete confirmation ──
  const [deletingQuestion, setDeletingQuestion] = useState<QuizQuestion | null>(null);

  function openCreate() {
    setEditingId(null);
    setFormQuestion("");
    setFormOptions(makeEmptyOptions());
    setFormExplanation("");
    setShowForm(true);
  }

  function openEdit(q: QuizQuestion) {
    setEditingId(q.id);
    setFormQuestion(q.question);
    setFormOptions(
      q.options.length > 0
        ? q.options.map((o) => ({ ...o }))
        : makeEmptyOptions()
    );
    setFormExplanation(q.explanation ?? "");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
  }

  function addOption() {
    if (formOptions.length >= 4) return;
    setFormOptions((prev) => [...prev, { ...EMPTY_OPTION }]);
  }

  function removeOption(idx: number) {
    if (formOptions.length <= 2) return;
    setFormOptions((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateOptionText(idx: number, text: string) {
    setFormOptions((prev) =>
      prev.map((o, i) => (i === idx ? { ...o, text } : o))
    );
  }

  function setCorrectOption(idx: number) {
    setFormOptions((prev) =>
      prev.map((o, i) => ({ ...o, isCorrect: i === idx }))
    );
  }

  function handleSave() {
    if (!formQuestion.trim()) {
      error("Fragetext ist erforderlich.");
      return;
    }
    const validOptions = formOptions.filter((o) => o.text.trim().length > 0);
    if (validOptions.length < 2) {
      error("Mindestens 2 Antwortmöglichkeiten erforderlich.");
      return;
    }
    if (!validOptions.some((o) => o.isCorrect)) {
      error("Markiere mindestens eine richtige Antwort.");
      return;
    }

    startTransition(async () => {
      const res = await saveQuizQuestion(
        moduleId,
        formQuestion.trim(),
        validOptions,
        formExplanation.trim() || null,
        null,
        editingId
      );
      if (res.ok) {
        success(editingId ? "Frage aktualisiert." : "Frage erstellt.");
        closeForm();
        router.refresh();
      } else {
        error(res.error ?? "Speichern fehlgeschlagen.");
      }
    });
  }

  function handleDelete() {
    if (!deletingQuestion) return;
    const id = deletingQuestion.id;
    startTransition(async () => {
      const res = await deleteQuizQuestion(id);
      if (res.ok) {
        success("Frage gelöscht.");
        setDeletingQuestion(null);
        router.refresh();
      } else {
        error(res.error ?? "Löschen fehlgeschlagen.");
      }
    });
  }

  function moveQuestion(index: number, dir: "up" | "down") {
    const target = index + (dir === "up" ? -1 : 1);
    if (target < 0 || target >= questions.length) return;
    const ids = questions.map((q) => q.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    startTransition(async () => {
      const res = await reorderQuizQuestions(moduleId, ids);
      if (res.ok) {
        router.refresh();
      } else {
        error(res.error ?? "Sortierung fehlgeschlagen.");
      }
    });
  }

  const LABELS = ["A", "B", "C", "D"];

  return (
    <>
      <div className="mt-1 rounded-lg border border-white/8 bg-obsidian/30 px-3 py-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-3.5 w-3.5 flex-shrink-0 text-gold-300/70" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-cream/45">
              Quiz ({questions.length}{" "}
              {questions.length === 1 ? "Frage" : "Fragen"})
            </span>
          </div>
          <AdminButton
            variant="secondary"
            size="sm"
            icon={Plus}
            onClick={openCreate}
          >
            Frage hinzufügen
          </AdminButton>
        </div>

        {questions.length === 0 ? (
          <p className="rounded-lg border border-dashed border-white/10 px-3 py-4 text-center text-xs text-cream/30">
            Noch keine Quizfragen. Füge Fragen hinzu, die am Ende des Moduls
            erscheinen.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {questions
              .sort((a, b) => a.position - b.position)
              .map((q, qi) => {
                const correctOpt = q.options.find((o) => o.isCorrect);
                return (
                  <div
                    key={q.id}
                    className="rounded-lg border border-white/8 bg-obsidian/50 px-3 py-2.5 transition-colors hover:border-white/15"
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-4 w-4 flex-shrink-0 text-cream/15" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-cream/85">
                          {qi + 1}. {q.question}
                        </p>
                        <p className="mt-0.5 flex items-center gap-2 text-[11px] text-cream/35">
                          <span>
                            {q.options.length} Optionen
                          </span>
                          {correctOpt && (
                            <span className="inline-flex items-center gap-1 text-emerald-400/70">
                              Richtig: {correctOpt.text.slice(0, 30)}
                              {correctOpt.text.length > 30 ? "..." : ""}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-1">
                        <button
                          onClick={() => moveQuestion(qi, "up")}
                          disabled={pending || qi === 0}
                          className="text-cream/30 transition-colors hover:text-gold-300 disabled:opacity-20"
                          aria-label="Frage nach oben"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => moveQuestion(qi, "down")}
                          disabled={pending || qi === questions.length - 1}
                          className="text-cream/30 transition-colors hover:text-gold-300 disabled:opacity-20"
                          aria-label="Frage nach unten"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                        <AdminButton
                          variant="ghost"
                          size="sm"
                          icon={Pencil}
                          onClick={() => openEdit(q)}
                        >
                          Bearbeiten
                        </AdminButton>
                        <button
                          onClick={() => setDeletingQuestion(q)}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-cream/30 transition-colors hover:bg-red-500/10 hover:text-red-300"
                          aria-label="Frage löschen"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* ── Create / Edit question modal ── */}
      <Modal
        open={showForm}
        onClose={closeForm}
        title={editingId ? "Frage bearbeiten" : "Neue Quizfrage"}
        size="md"
        footer={
          <>
            <AdminButton
              variant="ghost"
              size="sm"
              onClick={closeForm}
              disabled={pending}
            >
              Abbrechen
            </AdminButton>
            <AdminButton
              variant="primary"
              size="sm"
              onClick={handleSave}
              loading={pending}
            >
              {editingId ? "Aktualisieren" : "Erstellen"}
            </AdminButton>
          </>
        }
      >
        <div className="grid gap-4">
          <label className="block">
            <span className="tac-label mb-1.5 block">Frage *</span>
            <textarea
              autoFocus
              value={formQuestion}
              onChange={(e) => setFormQuestion(e.target.value)}
              rows={2}
              placeholder="z. B. Welche Methode eignet sich am besten zur Nischenvalidierung?"
              className={`${inputClass} resize-y`}
            />
          </label>

          <div>
            <span className="tac-label mb-2 block">
              Antwortmöglichkeiten * (klicke den Radio-Button für die richtige Antwort)
            </span>
            <div className="flex flex-col gap-2">
              {formOptions.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <label
                    className="flex h-8 w-8 flex-none cursor-pointer items-center justify-center"
                    title="Als richtige Antwort markieren"
                  >
                    <input
                      type="radio"
                      name="correctOption"
                      checked={opt.isCorrect}
                      onChange={() => setCorrectOption(idx)}
                      className="h-4 w-4 accent-gold-300"
                    />
                  </label>
                  <span className="flex h-7 w-7 flex-none items-center justify-center rounded-md border border-white/15 bg-white/[0.03] text-[11px] font-bold text-cream/40">
                    {LABELS[idx]}
                  </span>
                  <input
                    value={opt.text}
                    onChange={(e) => updateOptionText(idx, e.target.value)}
                    placeholder={`Option ${LABELS[idx]}`}
                    className={`${inputClass} flex-1`}
                  />
                  {formOptions.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(idx)}
                      className="flex h-7 w-7 flex-none items-center justify-center rounded-md text-cream/30 transition-colors hover:bg-red-500/10 hover:text-red-300"
                      aria-label="Option entfernen"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {formOptions.length < 4 && (
              <button
                type="button"
                onClick={addOption}
                className="mt-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cream/40 transition-colors hover:text-gold-300"
              >
                <Plus className="h-3.5 w-3.5" />
                Option hinzufügen
              </button>
            )}
          </div>

          <label className="block">
            <span className="tac-label mb-1.5 block">
              Erklärung (optional — wird nach Antwort angezeigt)
            </span>
            <textarea
              value={formExplanation}
              onChange={(e) => setFormExplanation(e.target.value)}
              rows={2}
              placeholder="Warum ist das die richtige Antwort?"
              className={`${inputClass} resize-y`}
            />
          </label>
        </div>
      </Modal>

      {/* ── Delete confirmation ── */}
      <Modal
        open={Boolean(deletingQuestion)}
        onClose={() => setDeletingQuestion(null)}
        title="Frage löschen?"
        size="sm"
        footer={
          <>
            <AdminButton
              variant="ghost"
              size="sm"
              onClick={() => setDeletingQuestion(null)}
            >
              Abbrechen
            </AdminButton>
            <AdminButton
              variant="danger"
              size="sm"
              icon={Trash2}
              loading={pending}
              onClick={handleDelete}
            >
              Löschen
            </AdminButton>
          </>
        }
      >
        <p className="text-sm text-cream/70">
          <span className="font-bold text-cream">
            {deletingQuestion?.question}
          </span>{" "}
          wird dauerhaft entfernt.
        </p>
      </Modal>
    </>
  );
}
