"use client";

import { useState } from "react";

/**
 * חיווי "גלול" ב-Hero — מספריים של ספר. בכניסה: כמה סבבים מלאים (לא אחד),
 * ואז לופ נסניס (פתיחה/סגירה) שמצביע מטה. לחיצה/Enter — סבב נוסף + גלילה
 * לסקציה הבאה (`scrollTargetId`). שני שכבות הסבוב (כניסה + לחיצה) על אלמנטים
 * נפרדים בכוונה — כך שהחלפת ה-class בלחיצה לא "מתחרה" על property ה-animation
 * עם אנימציית הכניסה (שכבר הסתיימה) ומפעילה אותה מחדש בטעות.
 */
export function ScissorsScrollIndicator({
  label,
  scrollTargetId,
}: {
  label: string;
  scrollTargetId: string;
}) {
  const [isClickSpinning, setIsClickSpinning] = useState(false);

  function handleClick() {
    document.getElementById(scrollTargetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setIsClickSpinning(true);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      className="focus-visible:ring-accent focus-visible:ring-offset-ink scissors-cue rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <span className="scissors-intro">
        <span
          className={`scissors-click-spin-wrap${isClickSpinning ? " is-spinning" : ""}`}
          onAnimationEnd={() => setIsClickSpinning(false)}
        >
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <g className="scissors-blade scissors-blade-r">
              <circle cx="15.5" cy="5" r="2.3" />
              <path
                d="M12.9,10.2 C13.3,12 13.0,16 12.3,19.5 C12.15,20.2 11.85,20.6 11.6,21 C11.4,20.5 11.55,18 11.7,15 C11.85,12.5 11.6,10.6 11.1,10.1 C11.5,9.85 12.5,9.85 12.9,10.2 Z"
                fill="currentColor"
                stroke="none"
              />
            </g>
            <g className="scissors-blade scissors-blade-l">
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
      </span>
    </button>
  );
}
