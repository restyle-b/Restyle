"use client";

import { useEffect, useState } from "react";

function computeReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.classList.contains("a11y-no-motion")
  );
}

/**
 * true אם יש לצמצם תנועה — לפי הגדרת מערכת ההפעלה (prefers-reduced-motion)
 * או לפי תפריט הנגישות של האתר (class `a11y-no-motion` על ה-html, שמתווסף/
 * מוסר בלי רענון דף). מגיב בזמן אמת לשינוי בשני המקורות, כדי שרכיבי
 * scroll-reveal (Reveal/ScrollFeature/CutHeading/CutLineDivider) יחשפו את
 * כל התוכן מיד כשהמשתמש מפעיל את "עצירת אנימציות", ולא רק ברגע שהם נכנסים
 * לאזור הצפייה בגלילה.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(computeReducedMotion);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const recompute = () => setReduced(computeReducedMotion());

    recompute();
    mql.addEventListener("change", recompute);

    const observer = new MutationObserver(recompute);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      mql.removeEventListener("change", recompute);
      observer.disconnect();
    };
  }, []);

  return reduced;
}
