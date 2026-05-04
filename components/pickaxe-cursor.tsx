"use client";

import { useEffect, useState } from "react";

export function PickaxeCursor() {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const [active, setActive] = useState(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });

    const onOver = (e: MouseEvent) => {
      const el = e.target as Element;
      setActive(
        !!el.closest("a, button, [role='button'], select, input[type='submit'], input[type='button']")
      );
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
    };
  }, []);

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        pointerEvents: "none",
        zIndex: 99999,
        transform: "translate(-8px, -38px) rotate(-20deg)",
        fontSize: "40px",
        lineHeight: 1,
        userSelect: "none",
        opacity: active ? 1 : 0,
        transition: "opacity 0.08s",
        filter: "brightness(0) drop-shadow(0 0 3px rgba(255,255,255,0.3))",
      }}
    >
      ⛏
    </div>
  );
}
