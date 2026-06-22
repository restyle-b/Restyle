"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** כיוון הכניסה של ה-Reveal. ברירת מחדל: up (עלייה עדינה). */
type RevealDirection = "up" | "down" | "left" | "right" | "scale";

/** מצב התחלתי (מוסתר) לכל כיוון — מסתיים תמיד ב-translate-0/scale-100/opacity-100. */
const HIDDEN_BY_DIRECTION: Record<RevealDirection, string> = {
  up: "translate-y-6 opacity-0",
  down: "-translate-y-6 opacity-0",
  left: "translate-x-6 opacity-0",
  right: "-translate-x-6 opacity-0",
  scale: "scale-95 opacity-0",
};

/**
 * עוטף תוכן ב-fade/slide עדין כשהוא נכנס למסך בגלילה (ראה docs/DESIGN.md).
 * - direction: כיוון הכניסה (ברירת מחדל "up").
 * - delay: השהיה ב-ms ל-stagger בגריד/רשימה.
 * מכבד prefers-reduced-motion (מציג מיד, בלי תנועה).
 */
export function Reveal({
  children,
  className,
  direction = "up",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  direction?: RevealDirection;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn(
        "transition-all duration-700 ease-out motion-reduce:transition-none",
        visible ? "translate-x-0 translate-y-0 scale-100 opacity-100" : HIDDEN_BY_DIRECTION[direction],
        className,
      )}
    >
      {children}
    </div>
  );
}
