"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Megaphone,
  Tag,
  Star,
  Send,
  Mail,
  Type,
  ChevronDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Panel } from "@/components/admin/ui";
import { AdminButton } from "@/components/admin/admin-button";
import { useToast } from "@/components/admin/toast";
import { cn } from "@/lib/utils";
import { upsertSetting } from "@/app/admin/einstellungen/actions";

type SettingValue = Record<string, unknown>;

const inputClass =
  "w-full rounded-lg border border-white/10 bg-obsidian/60 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-300/40 focus:outline-none";

function str(value: SettingValue | undefined, field: string): string {
  if (!value) return "";
  const raw = value[field];
  return typeof raw === "string" ? raw : "";
}

function bool(value: SettingValue | undefined): boolean {
  return value?.enabled === true;
}

/** A labelled text input row. */
function Field({
  label,
  hint,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "url" | "email";
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="tac-label mb-1.5 block">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
      {hint && <span className="mt-1 block text-xs text-cream/30">{hint}</span>}
    </label>
  );
}

/** A switch-style toggle row used by the banner sections. */
function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-white/10 bg-obsidian/40 px-3 py-2.5">
      <span className="text-sm font-bold text-cream/80">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full border transition-colors",
          checked
            ? "border-gold-300/50 bg-gold-400/80"
            : "border-white/15 bg-white/5"
        )}
      >
        <span
          className={cn(
            "inline-block h-3.5 w-3.5 transform rounded-full bg-obsidian transition-transform",
            checked ? "translate-x-[18px]" : "translate-x-[3px]"
          )}
        />
      </button>
    </label>
  );
}

/** One self-saving section of the settings editor. */
function Section({
  icon: Icon,
  title,
  description,
  children,
  onSave,
  saving,
  collapsible,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  children: ReactNode;
  onSave: () => void;
  saving: boolean;
  collapsible?: boolean;
}) {
  const [open, setOpen] = useState(!collapsible);

  return (
    <section className="rounded-xl border border-white/10 bg-panel/30">
      <header
        className={cn(
          "flex items-center gap-3 px-4 py-3",
          collapsible && "cursor-pointer select-none"
        )}
        onClick={collapsible ? () => setOpen((v) => !v) : undefined}
      >
        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-gold-300/20 bg-gold-300/[0.06] text-gold-200">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-cream">{title}</h3>
          {description && (
            <p className="mt-0.5 text-xs text-cream/40">{description}</p>
          )}
        </div>
        {collapsible && (
          <ChevronDown
            className={cn(
              "h-4 w-4 flex-shrink-0 text-cream/40 transition-transform",
              open && "rotate-180"
            )}
          />
        )}
      </header>

      {open && (
        <div className="border-t border-white/5 px-4 py-4">
          <div className="flex flex-col gap-4">{children}</div>
          <div className="mt-4 flex justify-end">
            <AdminButton
              variant="primary"
              size="sm"
              icon={Save}
              onClick={onSave}
              loading={saving}
            >
              Speichern
            </AdminButton>
          </div>
        </div>
      )}
    </section>
  );
}

export function SettingsEditor({
  settings,
}: {
  settings: Record<string, SettingValue>;
}) {
  const router = useRouter();
  const { success, error } = useToast();
  const [pending, startTransition] = useTransition();
  const [activeKey, setActiveKey] = useState<string | null>(null);

  // Announcement bar
  const [annEnabled, setAnnEnabled] = useState(() =>
    bool(settings.announcement_bar)
  );
  const [annText, setAnnText] = useState(() =>
    str(settings.announcement_bar, "text")
  );
  const [annHref, setAnnHref] = useState(() =>
    str(settings.announcement_bar, "href")
  );

  // Promo banner
  const [promoEnabled, setPromoEnabled] = useState(() =>
    bool(settings.promo_banner)
  );
  const [promoText, setPromoText] = useState(() =>
    str(settings.promo_banner, "text")
  );
  const [promoHref, setPromoHref] = useState(() =>
    str(settings.promo_banner, "href")
  );

  // Featured course
  const [featuredSlug, setFeaturedSlug] = useState(() =>
    str(settings.featured_course, "slug")
  );

  // Telegram
  const [tgFree, setTgFree] = useState(() => str(settings.telegram, "free_url"));
  const [tgPaid, setTgPaid] = useState(() => str(settings.telegram, "paid_url"));

  // Contact
  const [contactEmail, setContactEmail] = useState(() =>
    str(settings.contact, "email")
  );

  // Hero
  const [heroHeadline, setHeroHeadline] = useState(() =>
    str(settings.hero, "headline")
  );
  const [heroSubline, setHeroSubline] = useState(() =>
    str(settings.hero, "subline")
  );

  function save(key: string, value: SettingValue) {
    setActiveKey(key);
    startTransition(async () => {
      const res = await upsertSetting({ key, value });
      setActiveKey(null);
      if (res.ok) {
        success("Gespeichert.");
        router.refresh();
      } else {
        error(res.error ?? "Speichern fehlgeschlagen.");
      }
    });
  }

  const saving = (key: string) => pending && activeKey === key;

  return (
    <Panel
      title="Website-Einstellungen"
      description="Häufig geänderte Inhalte oben, selten geänderte unten. Jeder Abschnitt wird einzeln gespeichert."
    >
      <div className="flex flex-col gap-4">
        {/* Announcement bar */}
        <Section
          icon={Megaphone}
          title="Ankündigungs-Banner"
          description="Schlanke Leiste ganz oben auf der Website."
          saving={saving("announcement_bar")}
          onSave={() =>
            save("announcement_bar", {
              enabled: annEnabled,
              text: annText.trim(),
              href: annHref.trim(),
            })
          }
        >
          <Toggle
            checked={annEnabled}
            onChange={setAnnEnabled}
            label="Banner anzeigen"
          />
          <Field
            label="Text"
            value={annText}
            onChange={setAnnText}
            placeholder="z. B. Black Friday: 30 % auf alle Kurse"
          />
          <Field
            label="Link (optional)"
            type="url"
            value={annHref}
            onChange={setAnnHref}
            hint="Wohin der Banner führt, wenn man darauf klickt."
            placeholder="https://… oder /kurse"
          />
        </Section>

        {/* Promo banner */}
        <Section
          icon={Tag}
          title="Aktion / Promo-Banner"
          description="Aktionshinweis für Rabatte und Kampagnen."
          saving={saving("promo_banner")}
          onSave={() =>
            save("promo_banner", {
              enabled: promoEnabled,
              text: promoText.trim(),
              href: promoHref.trim(),
            })
          }
        >
          <Toggle
            checked={promoEnabled}
            onChange={setPromoEnabled}
            label="Promo anzeigen"
          />
          <Field
            label="Text"
            value={promoText}
            onChange={setPromoText}
            placeholder="z. B. Nur heute: Gutscheincode GOLD20"
          />
          <Field
            label="Link (optional)"
            type="url"
            value={promoHref}
            onChange={setPromoHref}
            placeholder="https://… oder /kurse"
          />
        </Section>

        {/* Featured course */}
        <Section
          icon={Star}
          title="Featured-Kurs"
          description="Hervorgehobener Kurs auf der Startseite."
          saving={saving("featured_course")}
          onSave={() =>
            save("featured_course", { slug: featuredSlug.trim() })
          }
        >
          <Field
            label="Kurs-Slug"
            value={featuredSlug}
            onChange={setFeaturedSlug}
            hint="Der Slug des Kurses (z. B. ai-goldmining-masterclass)."
            placeholder="kurs-slug"
          />
        </Section>

        {/* Telegram */}
        <Section
          icon={Send}
          title="Telegram-Links"
          description="Links zur kostenlosen und bezahlten Community."
          saving={saving("telegram")}
          onSave={() =>
            save("telegram", {
              free_url: tgFree.trim(),
              paid_url: tgPaid.trim(),
            })
          }
        >
          <Field
            label="Kostenlose Gruppe"
            type="url"
            value={tgFree}
            onChange={setTgFree}
            placeholder="https://t.me/…"
          />
          <Field
            label="Bezahlte Gruppe"
            type="url"
            value={tgPaid}
            onChange={setTgPaid}
            placeholder="https://t.me/…"
          />
        </Section>

        {/* Contact */}
        <Section
          icon={Mail}
          title="Kontakt"
          description="Öffentliche E-Mail-Adresse für Anfragen."
          saving={saving("contact")}
          onSave={() => save("contact", { email: contactEmail.trim() })}
        >
          <Field
            label="Kontakt-E-Mail"
            type="email"
            value={contactEmail}
            onChange={setContactEmail}
            placeholder="kontakt@beispiel.de"
          />
        </Section>

        {/* Hero (collapsed, de-emphasized) */}
        <Section
          icon={Type}
          title="Hero-Texte"
          description="Überschrift & Unterzeile der Startseite — selten geändert."
          collapsible
          saving={saving("hero")}
          onSave={() =>
            save("hero", {
              headline: heroHeadline.trim(),
              subline: heroSubline.trim(),
            })
          }
        >
          <Field
            label="Hero-Überschrift"
            value={heroHeadline}
            onChange={setHeroHeadline}
            hint="Die große Hauptüberschrift auf der Startseite."
            placeholder="z. B. Verwandle KI in deine Goldmine"
          />
          <Field
            label="Hero-Unterzeile"
            value={heroSubline}
            onChange={setHeroSubline}
            hint="Der erklärende Text unter der Hauptüberschrift."
            placeholder="Kurzer Untertitel"
          />
        </Section>
      </div>
    </Panel>
  );
}
