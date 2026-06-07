"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function PickaxeCursor() {
  const elRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  // The admin area uses a normal cursor (data-entry heavy), so skip there.
  const isAdmin = pathname?.startsWith("/admin") ?? false;

  useEffect(() => {
    if (isAdmin) return;
    const el = elRef.current;
    if (!el) return;

    // Skip on touch / coarse pointers — no custom cursor there.
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let targetX = -200;
    let targetY = -200;
    let curX = -200;
    let curY = -200;
    let rafId = 0;
    let visible = false;

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!visible) {
        // snap on first move to avoid a long slide-in from the corner
        curX = targetX;
        curY = targetY;
        visible = true;
        el.style.opacity = "1";
      }
    };

    const tick = () => {
      // light smoothing — follows fast but stays buttery
      curX += (targetX - curX) * 0.35;
      curY += (targetY - curY) * 0.35;
      el.style.transform = `translate3d(${curX}px, ${curY}px, 0) rotate(-20deg)`;
      rafId = requestAnimationFrame(tick);
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.classList.add("hide-system-cursor");
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("mousemove", onMove);
      document.documentElement.classList.remove("hide-system-cursor");
    };
  }, [isAdmin]);

  if (isAdmin) return null;

  return (
    <div
      ref={elRef}
      aria-hidden
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        marginLeft: -4,
        marginTop: -4,
        fontSize: "26px",
        lineHeight: 1,
        opacity: 0,
        pointerEvents: "none",
        zIndex: 99999,
        transform: "translate3d(-200px, -200px, 0) rotate(-20deg)",
        willChange: "transform",
        filter:
          "drop-shadow(0 0 2px rgba(255,255,255,1)) drop-shadow(0 0 6px rgba(255,255,255,0.8)) drop-shadow(0 0 12px rgba(232,192,64,0.6))",
      }}
    >
      ⛏️
    </div>
  );
}
