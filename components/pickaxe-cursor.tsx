"use client";

import { useEffect, useRef } from "react";

export function PickaxeCursor() {
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    let rafId = 0;
    let targetX = -200;
    let targetY = -200;

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        el.style.transform = `translate(${targetX}px, ${targetY}px) rotate(-20deg)`;
      });
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.classList.add("hide-system-cursor");

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("mousemove", onMove);
      document.documentElement.classList.remove("hide-system-cursor");
    };
  }, []);

  return (
    <div
      ref={elRef}
      aria-hidden
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        pointerEvents: "none",
        zIndex: 99999,
        transform: "translate(-200px, -200px) rotate(-20deg)",
        fontSize: "26px",
        lineHeight: 1,
        userSelect: "none",
        willChange: "transform",
        filter:
          "drop-shadow(0 0 2px rgba(255,255,255,1)) drop-shadow(0 0 6px rgba(255,255,255,0.8)) drop-shadow(0 0 12px rgba(232,192,64,0.6))",
      }}
    >
      ⛏️
    </div>
  );
}
