"use client";

import { useEffect, useState } from "react";

export function PickaxeCursor() {
  const [pos, setPos] = useState({ x: -200, y: -200 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });

    document.addEventListener("mousemove", onMove);
    document.documentElement.classList.add("hide-system-cursor");

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.documentElement.classList.remove("hide-system-cursor");
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
        transform: "translate(-50%, -50%) rotate(-20deg)",
        fontSize: "44px",
        lineHeight: 1,
        userSelect: "none",
        opacity: 1,
        transition: "transform 0.1s ease-out",
        filter: "drop-shadow(0 0 5px rgba(232,192,64,0.4))",
      }}
    >
      ⛏️
    </div>
  );
}
