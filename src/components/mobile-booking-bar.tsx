"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { buttonVariants } from "@/components/ui/button";
import { BookingLink } from "@/components/booking-link";
import { cn } from "@/lib/utils";

/**
 * סרגל "קביעת תור" צמוד-תחתית במובייל בלבד — מופיע רק לאחר גלילה מעבר
 * ל-CTA של ה-Hero, כדי שה-CTA הראשי יישאר זמין תמיד ביד אחת בלי לחזור למעלה
 * (דפוס נפוץ באתרי הזמנה/מסחר מובייל מובילים).
 */
export function MobileBookingBar() {
  const t = useTranslations("nav");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setVisible(window.scrollY > 480);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-line-dark bg-ink/95 px-4 pt-3 backdrop-blur transition-transform duration-300 ease-out sm:hidden print:hidden",
        "pb-[max(env(safe-area-inset-bottom),0.75rem)]",
        visible ? "translate-y-0" : "translate-y-full",
      )}
    >
      <BookingLink
        className={buttonVariants({ size: "lg", variant: "light", className: "w-full" })}
      >
        {t("bookingCta")}
      </BookingLink>
    </div>
  );
}
