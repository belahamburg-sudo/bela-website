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
  const [cashPercent, setCashPercent] = useState("20");
  const [selfDiscount, setSelfDiscount] = useState("10");
  const [canIssueCoupons, setCanIssueCoupons] = useState(false);

  function reset() {
    setEmail("");
    setCashPercent("20");
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
        cashPercent: Number(cashPercent) || 0,
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

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="tac-label">Provision (%)</span>
              <input
                type="number"
                min={0}
                max={100}
                value={cashPercent}
                onChange={(e) => setCashPercent(e.target.value)}
                className={inputClass}
              />
            </label>
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
            <span className="text-sm text-cream/70">Darf eigene Gutscheine ausgeben</span>
          </label>
        </div>
      </Modal>
    </>
  );
}
