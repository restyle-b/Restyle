"use client";

import { useEffect, useState } from "react";

type Theme = "day" | "night";

/**
 * מתג מצב יום/לילה — בקרה מפולחת (יום · לילה) בכותרת. הערך הראשוני נקרא מ-
 * `data-theme` שכבר נקבע ע"י הסקריפט ב-layout (לפי הגדרת המכשיר / localStorage),
 * כך שאין קפיצה. בחירה ידנית נשמרת ב-localStorage וגוברת על הגדרת המכשיר.
 */
export function ThemeToggle({
  dayLabel,
  nightLabel,
  ariaLabel,
}: {
  dayLabel: string;
  nightLabel: string;
  ariaLabel: string;
}) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    setTheme(current === "day" ? "day" : "night");
  }, []);

  function apply(next: Theme) {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* localStorage לא זמין (מצב פרטי וכו') — לא קריטי */
    }
    setTheme(next);
  }

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="border-current/30 text-current inline-flex items-center rounded-full border p-0.5"
    >
      <button
        type="button"
        onClick={() => apply("day")}
        aria-pressed={theme === "day"}
        title={dayLabel}
        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
          theme === "day"
            ? "bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)]"
            : "opacity-65 hover:opacity-100"
        }`}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" />
        </svg>
        <span className="hidden sm:inline">{dayLabel}</span>
      </button>
      <button
        type="button"
        onClick={() => apply("night")}
        aria-pressed={theme === "night"}
        title={nightLabel}
        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
          theme === "night"
            ? "bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)]"
            : "opacity-65 hover:opacity-100"
        }`}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="none"
          aria-hidden="true"
        >
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
        <span className="hidden sm:inline">{nightLabel}</span>
      </button>
    </div>
  );
}
