"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * כותרת ש"נחתכת" — בכניסה לאזור הצפייה הטקסט נחשף ב-wipe מהצד הלוגי (ימין ב-RTL,
 * שמאל ב-LTR) כאילו מספריים גזרו אותו לאורכו. החשיפה היא `clip-path: inset` —
 * מאפיין paint/composite שאינו גורם reflow, ומטפל גם בכותרות רב-שורתיות (חותך את
 * כל הבלוק, לא שורה בודדת). הכיווניות נשלטת ב-CSS דרך scope של `[dir]`.
 *
 * נגישות: הטקסט תמיד ב-DOM (clip לא מסיר אותו מעץ הנגישות). תחת
 * prefers-reduced-motion ה-class `is-cut` מתווסף מיד והאנימציה קופאת למצב החשוף
 * המלא — הכותרת נראית רגיל, בלי wipe.
 */
export function CutHeading({
  title,
  className,
}: {
  title: string;
  className?: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [cut, setCut] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCut(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setCut(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <h2 ref={ref} className={cn("cut-title", cut && "is-cut", className)}>
      <span className="cut-title__text">{title}</span>
    </h2>
  );
}
