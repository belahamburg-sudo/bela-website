"use client";

import { useEffect, useState } from "react";

/**
 * Renders an email address without ever emitting the raw `user@domain` string
 * into the server HTML — defeats naive scrapers/spam harvesters. Before hydration
 * it shows an "[at]" placeholder with no mailto; on mount the real address and
 * mailto: link are assembled client-side. Looks identical to a normal link.
 */
export function ObfuscatedEmail({
  user,
  domain,
  className,
}: {
  user: string;
  domain: string;
  className?: string;
}) {
  const [revealed, setRevealed] = useState(false);
  useEffect(() => setRevealed(true), []);

  const text = revealed ? `${user}@${domain}` : `${user} [at] ${domain}`;

  return (
    <a
      href={revealed ? `mailto:${user}@${domain}` : undefined}
      className={className}
    >
      {text}
    </a>
  );
}
