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

  useEffect(() => {
    if (active) {
      document.documentElement.classList.add("hide-system-cursor");
    } else {
      document.documentElement.classList.remove("hide-system-cursor");
    }
  }, [active]);

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        left: pos.x,
        top: pos.y,
        pointerEvents: "none",
        zIndex: 99999,
        transform: "translate(-50%, -50%) rotate(-20deg)",
        fontSize: "44px",
        lineHeight: 1,
        userSelect: "none",
        opacity: active ? 1 : 0,
        transition: "opacity 0.12s, transform 0.1s ease-out",
        filter: "drop-shadow(0 0 5px rgba(212,175,55,0.4))",
      }}
    >
      ⛏️
    </div>
  );
}
