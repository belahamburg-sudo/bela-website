"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

type ToastTone = "success" | "error" | "info";
type Toast = { id: number; tone: ToastTone; message: string };

type ToastContextValue = {
  toast: (message: string, tone?: ToastTone) => void;
  success: (message: string) => void;
  error: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

const ICONS: Record<ToastTone, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
};

const TONE_CLASSES: Record<ToastTone, string> = {
  success: "border-emerald-500/30 text-emerald-200",
  error: "border-red-500/30 text-red-200",
  info: "border-gold-300/30 text-gold-100",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, tone: ToastTone = "info") => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, tone, message }]);
      setTimeout(() => remove(id), 4500);
    },
    [remove]
  );

  const success = useCallback((m: string) => toast(m, "success"), [toast]);
  const error = useCallback((m: string) => toast(m, "error"), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[200] flex w-full max-w-sm flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = ICONS[t.tone];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.95 }}
                className={`pointer-events-auto flex items-start gap-3 rounded-lg border bg-ink/95 px-4 py-3 shadow-soft backdrop-blur-xl ${TONE_CLASSES[t.tone]}`}
              >
                <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span className="flex-1 text-sm text-cream/90">{t.message}</span>
                <button
                  onClick={() => remove(t.id)}
                  className="text-cream/30 transition-colors hover:text-cream/70"
                  aria-label="Schließen"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
