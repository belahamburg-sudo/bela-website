"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

/**
 * Submit-Knopf für den Freebie-Trichter. Zeigt während des Absendens einen
 * Ladezustand, statt die Seite kommentarlos neu zu laden — sonst wirkt der
 * Klick wirkungslos, obwohl der Server längst gearbeitet hat.
 */
export function FreebieSubmitButton({
  children,
  pendingLabel,
  className,
  name,
  value,
}: {
  children: React.ReactNode;
  pendingLabel: string;
  className: string;
  name?: string;
  value?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={pending}
      aria-busy={pending}
      className={`${className} active:scale-[0.98] disabled:cursor-wait disabled:opacity-70`}
    >
      {pending ? (
        <>
          <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}
