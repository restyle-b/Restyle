"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

/**
 * כותרת ש"נחתכת" — בכניסה לאזור הצפייה הטקסט נחשף ב-wipe מהצד הלוגי (ימין ב-RTL,
 * שמאל ב-LTR) כאילו מספריים גזרו אותו לאורכו. החשיפה היא `clip-path: inset` —
 * מאפיין paint/composite שאינו גורם reflow, ומטפל גם בכותרות רב-שורתיות (חותך את
 * כל הבלוק, לא שורה בודדת). הכיווניות נשלטת ב-CSS דרך scope של `[dir]`.
 *
 * נגישות: הטקסט תמיד ב-DOM (clip לא מסיר אותו מעץ הנגישות). תחת
 * prefers-reduced-motion או תפריט הנגישות ה-class `is-cut` מתווסף מיד והאנימציה
 * קופאת למצב החשוף המלא — הכותרת נראית רגיל, בלי wipe.
 */
export function CutHeading({
  title,
  className,
  as = "h2",
}: {
  title: string;
  className?: string;
  /** רמת הכותרת הסמנטית — ראה SectionHeading */
  as?: "h1" | "h2";
}) {
  const HeadingTag = as;
  const ref = useRef<HTMLHeadingElement>(null);
  const [cut, setCut] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      setCut(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
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
  }, [reducedMotion]);

  return (
    <HeadingTag ref={ref} className={cn("cut-title", cut && "is-cut", className)}>
      <span className="cut-title__text">{title}</span>
    </HeadingTag>
  );
}
