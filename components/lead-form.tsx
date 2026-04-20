"use client";

import { ArrowRight, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { FormEvent, useState } from "react";
import { Button } from "./button";

type LeadFormProps = {
  source: "newsletter" | "webinar" | "community";
  compact?: boolean;
  ctaLabel?: string;
};

export function LeadForm({ source, compact, ctaLabel }: LeadFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      source
    };

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(result.message || "Fehler beim Speichern");
      setStatus("success");
      setMessage(result.message || "Du bist drin. Check deine Inbox.");
      event.currentTarget.reset();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Bitte versuche es erneut.");
    }
  }

  const defaultLabel = {
    newsletter: "Zugang sichern",
    webinar: "Platz reservieren",
    community: "Beitreten"
  }[source];

  return (
    <form
      onSubmit={onSubmit}
      className={compact ? "grid gap-3 sm:grid-cols-[1fr_1fr_auto]" : "grid gap-4"}
    >
      <Field id={`${source}-name`} label="Name" name="name" type="text" placeholder="Dein Vorname" autoComplete="name" />
      <Field
        id={`${source}-email`}
        label="E-Mail"
        name="email"
        type="email"
        required
        placeholder="du@mail.com"
        autoComplete="email"
      />
      <div className={compact ? "flex items-end" : ""}>
        <Button type="submit" disabled={status === "loading"} className="w-full">
          {status === "loading" ? (
            <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
          ) : status === "success" ? (
            <CheckCircle2 aria-hidden className="h-4 w-4" />
          ) : (
            <ArrowRight aria-hidden className="h-4 w-4" />
          )}
          {ctaLabel || defaultLabel}
        </Button>
      </div>
      {message ? (
        <p
          role="status"
          className={
            status === "error"
              ? "flex items-center gap-2 text-sm font-medium text-red-300"
              : "flex items-center gap-2 text-sm font-medium text-gold-200"
          }
        >
          {status === "error" ? (
            <AlertCircle aria-hidden className="h-4 w-4 flex-none" />
          ) : (
            <CheckCircle2 aria-hidden className="h-4 w-4 flex-none" />
          )}
          {message}
        </p>
      ) : null}
      <p className="text-[0.7rem] leading-relaxed text-muted">
        Mit der Anmeldung akzeptierst du die Datenschutzerklärung. Abmeldung jederzeit möglich.
      </p>
    </form>
  );
}

function Field({
  id,
  label,
  name,
  type,
  placeholder,
  required,
  autoComplete
}: {
  id: string;
  label: string;
  name: string;
  type: string;
  placeholder: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div className="group relative">
      <label
        className="mb-2 block text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-gold-300"
        htmlFor={id}
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          required={required}
          placeholder={placeholder}
          className="focus-ring peer min-h-12 w-full rounded-xl border border-gold-500/15 bg-obsidian/80 px-4 text-cream placeholder:text-muted/70 transition-colors focus:border-gold-300/60"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-transparent transition-all duration-300 peer-focus:ring-gold-300/30"
          style={{
            boxShadow: "0 0 0 0 rgba(255, 215, 106, 0)"
          }}
        />
      </div>
    </div>
  );
}
