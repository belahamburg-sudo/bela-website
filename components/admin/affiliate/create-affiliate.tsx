"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { AdminButton } from "@/components/admin/admin-button";
import { Modal } from "@/components/admin/modal";
import { useToast } from "@/components/admin/toast";
import { createAffiliate } from "@/app/admin/affiliate/actions";

export function CreateAffiliate() {
  const router = useRouter();
  const { success, error } = useToast();
  const [pending, startTransition] = useTransition();

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [rewardType, setRewardType] = useState("percent_cash");
  const [cashPercent, setCashPercent] = useState("20");
  const [fixedCash, setFixedCash] = useState("");
  const [selfDiscount, setSelfDiscount] = useState("10");
  const [canIssueCoupons, setCanIssueCoupons] = useState(false);

  const showPercent = rewardType === "percent_cash" || rewardType === "both";
  const showFixed = rewardType === "fixed_cash" || rewardType === "both";

  function reset() {
    setEmail("");
    setCustomCode("");
    setRewardType("percent_cash");
    setCashPercent("20");
    setFixedCash("");
    setSelfDiscount("10");
    setCanIssueCoupons(false);
  }

  function handleCreate() {
    const trimmed = email.trim();
    if (!trimmed) {
      error("Bitte eine E-Mail angeben.");
      return;
    }
    startTransition(async () => {
      const res = await createAffiliate({
        email: trimmed,
        customCode: customCode.trim() || undefined,
        rewardType,
        cashPercent: showPercent ? Number(cashPercent) || 0 : 0,
        fixedCashCents: showFixed ? Math.round((Number(fixedCash) || 0) * 100) : 0,
        selfDiscountPercent: Number(selfDiscount) || 0,
        canIssueCoupons,
      });
      if (res.ok) {
        success("Affiliate angelegt.");
        reset();
        setOpen(false);
        router.refresh();
      } else {
        error(res.error ?? "Anlegen fehlgeschlagen.");
      }
    });
  }

  const inputClass =
    "w-full rounded-lg border border-white/10 bg-obsidian/60 px-3 py-2 text-sm text-cream placeholder:text-cream/30 focus:border-gold-300/40 focus:outline-none";

  return (
    <>
      <AdminButton variant="primary" size="md" icon={UserPlus} onClick={() => setOpen(true)}>
        Neuer Affiliate
      </AdminButton>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Neuen Affiliate anlegen"
        description="Verwandle einen registrierten Kunden in einen Partner."
        size="md"
        footer={
          <>
            <AdminButton variant="ghost" size="md" onClick={() => setOpen(false)}>
              Abbrechen
            </AdminButton>
            <AdminButton
              variant="primary"
              size="md"
              icon={UserPlus}
              onClick={handleCreate}
              loading={pending}
              disabled={!email.trim()}
            >
              Anlegen
            </AdminButton>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="tac-label">E-Mail des Kunden</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="kunde@example.com"
              className={inputClass}
            />
            <span className="text-xs text-cream/40">
              Der Kunde muss bereits ein Konto besitzen.
            </span>
          </label>

          <label className="flex flex-col gap-1">
            <span className="tac-label">Eigener Code (optional)</span>
            <input
              type="text"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
              placeholder="z. B. BELA20"
              className={`${inputClass} font-mono uppercase`}
            />
            <span className="text-xs text-cream/40">
              Leer lassen, um automatisch einen Code zu erzeugen. Link:
              /signup?ref=CODE
            </span>
          </label>

          <label className="flex flex-col gap-1">
            <span className="tac-label">Belohnungs-Typ</span>
            <select
              value={rewardType}
              onChange={(e) => setRewardType(e.target.value)}
              className={inputClass}
            >
              <option value="percent_cash" className="bg-ink text-cream">
                Cash % pro Verkauf
              </option>
              <option value="fixed_cash" className="bg-ink text-cream">
                Fixbetrag pro Verkauf
              </option>
              <option value="both" className="bg-ink text-cream">
                Beides
              </option>
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            {showPercent && (
              <label className="flex flex-col gap-1">
                <span className="tac-label">Cash % pro Verkauf</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={cashPercent}
                  onChange={(e) => setCashPercent(e.target.value)}
                  className={inputClass}
                />
              </label>
            )}
            {showFixed && (
              <label className="flex flex-col gap-1">
                <span className="tac-label">Fixbetrag pro Verkauf (€)</span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={fixedCash}
                  onChange={(e) => setFixedCash(e.target.value)}
                  className={inputClass}
                />
              </label>
            )}
            <label className="flex flex-col gap-1">
              <span className="tac-label">Eigenrabatt (%)</span>
              <input
                type="number"
                min={0}
                max={100}
                value={selfDiscount}
                onChange={(e) => setSelfDiscount(e.target.value)}
                className={inputClass}
              />
            </label>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={canIssueCoupons}
              onChange={(e) => setCanIssueCoupons(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-obsidian/60 accent-gold-400"
            />
            <span className="text-sm text-cream/70">darf eigene Gutscheine verteilen</span>
          </label>
        </div>
      </Modal>
    </>
  );
}
