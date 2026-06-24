"use client";

import { useEffect, useRef } from "react";

/**
 * Tracks page scroll as a 0..1 ref without triggering React re-renders —
 * the WebGL scene reads it inside useFrame, so React state would just add
 * redundant render churn on every scroll tick.
 */
export function useScrollProgress() {
  const progress = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.current = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return progress;
}
