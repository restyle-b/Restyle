"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/** מצב הנגישות הנשמר ב-localStorage */
type A11yState = {
  /** אחוז גודל גופן (100 = ברירת מחדל) */
  fontScale: number;
  contrast: boolean;
  grayscale: boolean;
  links: boolean;
  readable: boolean;
  noMotion: boolean;
  bigCursor: boolean;
};

const STORAGE_KEY = "restyle-a11y";
const FONT_MIN = 100;
const FONT_MAX = 150;
const FONT_STEP = 10;

const DEFAULT_STATE: A11yState = {
  fontScale: 100,
  contrast: false,
  grayscale: false,
  links: false,
  readable: false,
  noMotion: false,
  bigCursor: false,
};

/** טוען מצב שמור בבטחה (מתעלם מערכים לא תקינים) */
function loadState(): A11yState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<A11yState>;
    return {
      fontScale:
        typeof parsed.fontScale === "number"
          ? Math.min(FONT_MAX, Math.max(FONT_MIN, parsed.fontScale))
          : 100,
      contrast: Boolean(parsed.contrast),
      grayscale: Boolean(parsed.grayscale),
      links: Boolean(parsed.links),
      readable: Boolean(parsed.readable),
      noMotion: Boolean(parsed.noMotion),
      bigCursor: Boolean(parsed.bigCursor),
    };
  } catch {
    return DEFAULT_STATE;
  }
}

/** מחיל את המצב על תגית ה-html (מחלקות + גודל גופן) */
function applyState(state: A11yState) {
  const root = document.documentElement;
  root.style.fontSize = state.fontScale === 100 ? "" : `${state.fontScale}%`;
  root.classList.toggle("a11y-contrast", state.contrast);
  root.classList.toggle("a11y-grayscale", state.grayscale);
  root.classList.toggle("a11y-links", state.links);
  root.classList.toggle("a11y-readable", state.readable);
  root.classList.toggle("a11y-no-motion", state.noMotion);
  root.classList.toggle("a11y-big-cursor", state.bigCursor);
}

type ToggleKey = Exclude<keyof A11yState, "fontScale">;

const TOGGLES: { key: ToggleKey }[] = [
  { key: "contrast" },
  { key: "grayscale" },
  { key: "links" },
  { key: "readable" },
  { key: "noMotion" },
  { key: "bigCursor" },
];

export function AccessibilityMenu() {
  const t = useTranslations("accessibilityMenu");
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<A11yState>(DEFAULT_STATE);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  // טעינת המצב השמור אחרי הידרציה (נמנע מ-mismatch — השרת מרנדר ברירת מחדל)
  useEffect(() => {
    const loaded = loadState();
    setState(loaded);
    applyState(loaded);
  }, []);

  // ניהול מיקוד (WCAG 2.4.3 Focus Order): בפתיחה — מיקוד עובר לתוך הפאנל (כפתור
  // הסגירה), כדי ש-Tab הבא ימשיך בתוך הדיאלוג ולא ידלג עליו. בסגירה — חוזר
  // לכפתור שפתח את הפאנל, כך שמשתמש מקלדת לא "מאבד את המקום".
  useEffect(() => {
    if (open) closeButtonRef.current?.focus();
  }, [open]);

  const close = useCallback(() => {
    setOpen(false);
    toggleButtonRef.current?.focus();
  }, []);

  // החלה ושמירה בכל שינוי
  const update = useCallback((next: A11yState) => {
    setState(next);
    applyState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* localStorage חסום — מתעלמים */
    }
  }, []);

  const toggle = (key: ToggleKey) => update({ ...state, [key]: !state[key] });
  const changeFont = (delta: number) =>
    update({
      ...state,
      fontScale: Math.min(FONT_MAX, Math.max(FONT_MIN, state.fontScale + delta)),
    });
  const reset = () => update(DEFAULT_STATE);

  // סגירה ב-Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <div className="fixed bottom-4 start-4 z-[60] print:hidden">
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label={t("dialogAria")}
          className="mb-3 w-72 rounded-lg border border-line-dark bg-ink-soft p-4 text-right shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-white">{t("title")}</h2>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={close}
              aria-label={t("closeAria")}
              className="rounded p-1 text-neutral-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="mt-4">
            <p className="text-sm text-neutral-300">{t("fontSizeLabel")}</p>
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => changeFont(-FONT_STEP)}
                disabled={state.fontScale <= FONT_MIN}
                aria-label={t("decreaseAria")}
                className="flex-1 rounded border border-line-dark py-2 text-white hover:bg-ink disabled:opacity-40"
              >
                {t("decreaseSymbol")}
              </button>
              <span className="w-14 text-center text-sm text-neutral-300" aria-live="polite">
                {state.fontScale}%
              </span>
              <button
                type="button"
                onClick={() => changeFont(FONT_STEP)}
                disabled={state.fontScale >= FONT_MAX}
                aria-label={t("increaseAria")}
                className="flex-1 rounded border border-line-dark py-2 text-white hover:bg-ink disabled:opacity-40"
              >
                {t("increaseSymbol")}
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {TOGGLES.map(({ key }) => (
              <button
                key={key}
                type="button"
                onClick={() => toggle(key)}
                aria-pressed={state[key]}
                className={`rounded border px-2 py-2 text-xs transition-colors ${
                  state[key]
                    ? "border-accent bg-accent text-ink"
                    : "border-line-dark text-neutral-300 hover:bg-ink"
                }`}
              >
                {t(`toggles.${key}`)}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={reset}
            className="mt-4 w-full rounded border border-line-dark py-2 text-sm text-neutral-300 hover:bg-ink"
          >
            {t("resetButton")}
          </button>

          <Link
            href="/accessibility"
            className="mt-3 block text-center text-xs text-accent hover:underline"
          >
            {t("statementLink")}
          </Link>
        </div>
      )}

      <button
        ref={toggleButtonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={t("openAria")}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-ink shadow-lg transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-7 w-7"
          aria-hidden="true"
        >
          <circle cx="12" cy="3.5" r="2" />
          <path d="M21 7.5c0 .6-.5 1-1.1 1L15 8v3.2l1.9 6.6a1 1 0 0 1-1.9.6L13 13h-2l-2 5.4a1 1 0 0 1-1.9-.6L9 11.2V8l-4.9.5A1 1 0 0 1 3 7.5c0-.6.5-1 1.1-1.1L12 5.5l7.9.9c.6.1 1.1.5 1.1 1.1Z" />
        </svg>
      </button>
    </div>
  );
}
