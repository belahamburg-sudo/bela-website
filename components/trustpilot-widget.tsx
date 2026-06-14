"use client";

import { useEffect, useRef } from "react";
import { trustpilotBusinessUnitId, trustpilotUrl } from "@/lib/env";

const TRUSTPILOT_SCRIPT = "https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js";

/** Official TrustBox template ids (free — no Trustpilot subscription required). */
export const TRUSTPILOT_TEMPLATES = {
  micro: "5419b6ffb0d04a076446a9af",
  carousel: "53aa8912dec7e10d38f59f36",
} as const;

type TrustpilotWidgetProps = {
  templateId: string;
  height: string;
  className?: string;
};

function loadTrustpilotScript(): Promise<void> {
  const w = window as typeof window & {
    Trustpilot?: { loadFromElement: (el: HTMLElement, force?: boolean) => void };
  };

  return new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${TRUSTPILOT_SCRIPT}"]`);
    if (existing) {
      if (w.Trustpilot) resolve();
      else existing.addEventListener("load", () => resolve(), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = TRUSTPILOT_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    document.body.appendChild(script);
  });
}

/** Renders a live Trustpilot TrustBox from the public profile (free). */
export function TrustpilotWidget({ templateId, height, className = "" }: TrustpilotWidgetProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!trustpilotBusinessUnitId || !ref.current) return;
    let cancelled = false;

    loadTrustpilotScript().then(() => {
      if (cancelled || !ref.current) return;
      const w = window as typeof window & {
        Trustpilot?: { loadFromElement: (el: HTMLElement, force?: boolean) => void };
      };
      w.Trustpilot?.loadFromElement(ref.current, true);
    });

    return () => {
      cancelled = true;
    };
  }, [templateId, height]);

  if (!trustpilotBusinessUnitId) return null;

  return (
    <div
      ref={ref}
      className={`trustpilot-widget ${className}`.trim()}
      data-locale="de-DE"
      data-template-id={templateId}
      data-businessunit-id={trustpilotBusinessUnitId}
      data-style-height={height}
      data-style-width="100%"
      data-theme="dark"
      data-stars="1,2,3,4,5"
    >
      <a href={trustpilotUrl} target="_blank" rel="noopener noreferrer">
        Trustpilot
      </a>
    </div>
  );
}
