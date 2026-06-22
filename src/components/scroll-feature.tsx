"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * עוטף בלוק טקסט בסיפור-גלילה (scrollytelling): מודגש (opacity מלא) כשהוא
 * חולף במרכז המסך, מועם כשהוא מעל/מתחת לכך — לשימוש לצד תמונה sticky.
 * לא "תופס" את הגלילה (אין scroll-jacking) — רק תגובה חזותית לגלילה טבעית.
 * מכבד prefers-reduced-motion (מוצג תמיד במלוא העמימות).
 */
export function ScrollFeature({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setActive(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => setActive(!!entry?.isIntersecting), {
      rootMargin: "-40% 0px -40% 0px",
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-500 ease-out motion-reduce:transition-none",
        active ? "opacity-100" : "opacity-40",
        className,
      )}
    >
      {children}
    </div>
  );
}
