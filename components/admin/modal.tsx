"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const maxWidth =
    size === "sm" ? "max-w-md" : size === "lg" ? "max-w-3xl" : "max-w-xl";

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[150] flex items-start justify-center overflow-y-auto p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-obsidian/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className={`relative z-10 my-8 w-full ${maxWidth} rounded-2xl border border-white/10 bg-ink/95 shadow-soft backdrop-blur-xl`}
          >
            <header className="flex items-start justify-between gap-4 border-b border-white/5 px-6 py-5">
              <div className="min-w-0">
                <h2 className="text-lg font-extrabold tracking-tight text-cream">{title}</h2>
                {description && <p className="mt-1 text-sm text-cream/40">{description}</p>}
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-cream/40 transition-colors hover:bg-white/5 hover:text-cream"
                aria-label="Schließen"
              >
                <X className="h-4 w-4" />
              </button>
            </header>
            <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>
            {footer && (
              <footer className="flex items-center justify-end gap-2 border-t border-white/5 px-6 py-4">
                {footer}
              </footer>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
