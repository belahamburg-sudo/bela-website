"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { Panel } from "@/components/admin/ui";
import { AdminButton } from "@/components/admin/admin-button";
import { useToast } from "@/components/admin/toast";
import { upsertSetting } from "@/app/admin/einstellungen/actions";

type SettingValue = Record<string, unknown>;

type TextFieldDef = {
  kind: "text" | "url" | "email";
  key: string;
  label: string;
  hint?: string;
  field: "text" | "url";
  placeholder?: string;
};

const FIELDS: TextFieldDef[] = [
  {
    kind: "text",
    field: "text",
    key: "hero_headline",
    label: "Hero-Überschrift",
    hint: "Die große Hauptüberschrift auf der Startseite.",
    placeholder: "z. B. Verwandle KI in deine Goldmine",
  },
  {
    kind: "text",
    field: "text",
    key: "hero_subline",
    label: "Hero-Unterzeile",
    hint: "Der erklärende Text unter der Hauptüberschrift.",
    placeholder: "Kurzer Untertitel",
  },
  {
    kind: "email",
    field: "text",
    key: "contact_email",
    label: "Kontakt-E-Mail",
    hint: "Öffentliche E-Mail-Adresse für Anfragen.",
    placeholder: "kontakt@beispiel.de",
  },
  {
    kind: "url",
    field: "url",
    key: "instagram_url",
    label: "Instagram-URL",
    placeholder: "https://instagram.com/…",
  },
  {
    kind: "url",
    field: "url",
    key: "tiktok_url",
    label: "TikTok-URL",
    placeholder: "https://tiktok.com/@…",
  },
  {
    kind: "url",
    field: "url",
    key: "youtube_url",
    label: "YouTube-URL",
    placeholder: "https://youtube.com/@…",
  },
];

const inputClass =
  "w-full rounded-lg border border-white/10 bg-obsidian/60 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-300/40 focus:outline-none";

function readString(value: SettingValue | undefined, field: "text" | "url"): string {
  if (!value) return "";
  const raw = value[field];
  return typeof raw === "string" ? raw : "";
}

function readBool(value: SettingValue | undefined): boolean {
  if (!value) return false;
  return value.enabled === true;
}

type FormState = {
  values: Record<string, string>;
  announcementEnabled: boolean;
  announcementText: string;
};

export function SettingsEditor({
  settings,
}: {
  settings: Record<string, SettingValue>;
}) {
  const router = useRouter();
  const { success, error } = useToast();
  const [pending, startTransition] = useTransition();

  const [form, setForm] = useState<FormState>(() => {
    const values: Record<string, string> = {};
    for (const f of FIELDS) {
      values[f.key] = readString(settings[f.key], f.field);
    }
    return {
      values,
      announcementEnabled: readBool(settings["announcement_bar"]),
      announcementText: readString(settings["announcement_bar"], "text"),
    };
  });

  function setValue(key: string, value: string) {
    setForm((prev) => ({ ...prev, values: { ...prev.values, [key]: value } }));
  }

  function handleSave() {
    startTransition(async () => {
      const tasks: { key: string; value: SettingValue }[] = FIELDS.map((f) => ({
        key: f.key,
        value: { [f.field]: form.values[f.key]?.trim() ?? "" },
      }));
      tasks.push({
        key: "announcement_bar",
        value: {
          enabled: form.announcementEnabled,
          text: form.announcementText.trim(),
        },
      });

      for (const task of tasks) {
        const res = await upsertSetting(task);
        if (!res.ok) {
          error(res.error ?? "Speichern fehlgeschlagen.");
          return;
        }
      }
      success("Einstellungen gespeichert.");
      router.refresh();
    });
  }

  return (
    <Panel
      title="Website-Einstellungen"
      description="Texte, Kontaktdaten und Social-Links der öffentlichen Website."
      actions={
        <AdminButton
          variant="primary"
          size="sm"
          icon={Save}
          onClick={handleSave}
          loading={pending}
        >
          Speichern
        </AdminButton>
      }
    >
      <div className="flex flex-col gap-5">
        {FIELDS.map((f) => (
          <label key={f.key} className="block">
            <span className="tac-label mb-1.5 block">{f.label}</span>
            <input
              type={f.kind === "email" ? "email" : f.kind === "url" ? "url" : "text"}
              value={form.values[f.key] ?? ""}
              onChange={(e) => setValue(f.key, e.target.value)}
              placeholder={f.placeholder}
              className={inputClass}
            />
            {f.hint && <span className="mt-1 block text-xs text-cream/30">{f.hint}</span>}
          </label>
        ))}

        <div className="rounded-lg border border-white/10 bg-obsidian/40 p-4">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={form.announcementEnabled}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, announcementEnabled: e.target.checked }))
              }
              className="h-4 w-4 rounded border-white/20 bg-obsidian accent-gold-300 focus:ring-gold-300/40"
            />
            <span className="text-sm font-bold text-cream/80">Ankündigungsleiste</span>
          </label>
          <p className="mt-1 pl-7 text-xs text-cream/30">
            Banner am oberen Rand der Website (z. B. für Aktionen).
          </p>
          <div className="mt-3 pl-7">
            <input
              type="text"
              value={form.announcementText}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, announcementText: e.target.value }))
              }
              placeholder="Text der Ankündigungsleiste"
              className={inputClass}
            />
          </div>
        </div>
      </div>
    </Panel>
  );
}
