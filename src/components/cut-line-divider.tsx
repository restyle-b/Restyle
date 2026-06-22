"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * מפריד "קו גזירה" — מוטיב המספריים כשפה ויזואלית בין סקציות.
 * מספריים נוסעות לאורך קו מקווקו ו"גוזרות" אותו, עם הבזק אור שחולף בעקבותיהן
 * (אותה שפת מתכת-פרימיום כמו .btn-shine). האנימציה מופעלת כשהמפריד נכנס לאזור
 * הצפייה (class `is-cutting`). מרחק הנסיעה נמדד ב-JS ונשמר ב-`--cut-travel` עם
 * סימן לפי כיוון (RTL שלילי / LTR חיובי), כך שהמספריים נוסעות מתחילת הקו לסופו
 * בשני הכיוונים. תחת prefers-reduced-motion לא מפעילים את האנימציה כלל —
 * המספריים נשארות בתחילת הקו והקו שלם (מצב קריא וסטטי).
 *
 * דקורטיבי בלבד (aria-hidden) — אין בו מידע שאינו נגיש בדרך אחרת.
 */
export function CutLineDivider({
  className,
  tone = "light",
}: {
  className?: string;
  /** "light" — על רקע בהיר (paper); "dark" — על רקע כהה (ink). */
  tone?: "light" | "dark";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [cutting, setCutting] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      const dir = getComputedStyle(el).direction;
      const dist = el.clientWidth;
      el.style.setProperty("--cut-travel", `${dir === "rtl" ? -dist : dist}px`);
    };
    measure();
    window.addEventListener("resize", measure);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return () => window.removeEventListener("resize", measure);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setCutting(true);
          observer.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        "cut-line",
        // צבע יורש מצבע הטקסט של הסקציה (שמתהפך יום/לילה) — tone רק מכוון עוצמה
        tone === "dark" ? "text-current/70" : "text-current/45",
        cutting && "is-cutting",
        className,
      )}
    >
      <span className="cut-line__track" />
      <span className="cut-line__glow" />
      <span className="cut-line__scissors">
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <g className="scissors-blade cut-blade-r">
            <circle cx="15.5" cy="5" r="2.3" />
            <path
              d="M12.9,10.2 C13.3,12 13.0,16 12.3,19.5 C12.15,20.2 11.85,20.6 11.6,21 C11.4,20.5 11.55,18 11.7,15 C11.85,12.5 11.6,10.6 11.1,10.1 C11.5,9.85 12.5,9.85 12.9,10.2 Z"
              fill="currentColor"
              stroke="none"
            />
          </g>
          <g className="scissors-blade cut-blade-l">
            <circle cx="8.5" cy="5" r="2.3" />
            <path
              d="M11.1,10.2 C10.7,12 11.0,16 11.7,19.5 C11.85,20.2 12.15,20.6 12.4,21 C12.6,20.5 12.45,18 12.3,15 C12.15,12.5 12.4,10.6 12.9,10.1 C12.5,9.85 11.5,9.85 11.1,10.2 Z"
              fill="currentColor"
              stroke="none"
            />
          </g>
          <circle cx="12" cy="10" r="0.9" fill="currentColor" stroke="none" />
        </svg>
      </span>
    </div>
  );
}
