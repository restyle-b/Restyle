"use client";

import { useEffect, useRef, useState } from "react";

/**
 * פס התקדמות גלילה דק בראש העמוד (accent). מתמלא מצד ההתחלה הלוגי (ימין ב-RTL,
 * שמאל ב-LTR). קישוטי בלבד — aria-hidden. מכבד reduced-motion דרך ה-guard הגלובלי.
 */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const rtlRef = useRef(true);

  useEffect(() => {
    rtlRef.current = document.documentElement.dir !== "ltr";
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const el = document.documentElement;
        const max = el.scrollHeight - el.clientHeight;
        setProgress(max > 0 ? Math.min(1, el.scrollTop / max) : 0);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-0.5 print:hidden" aria-hidden="true">
      <div
        className="h-full bg-accent transition-transform duration-150 ease-out"
        style={{
          transform: `scaleX(${progress})`,
          transformOrigin: rtlRef.current ? "right" : "left",
        }}
      />
    </div>
  );
}
