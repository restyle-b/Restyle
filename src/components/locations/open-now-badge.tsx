"use client";

import { useEffect, useState } from "react";

/**
 * בודק אם השעה הנוכחית (של המבקר, בזמן אמת בצד הלקוח) נמצאת בתוך שעות
 * הפעילות — ראשון–חמישי 09:00–20:00, שישי 09:00–14:00, שבת סגור (תואם
 * ל-messages/*.json "hours"). מוצג רק אחרי mount כדי למנוע hydration
 * mismatch (השרת לא יודע את השעה המקומית של המבקר).
 */
function isOpenNow(): boolean {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  if (day >= 0 && day <= 4) return hour >= 9 && hour < 20;
  if (day === 5) return hour >= 9 && hour < 14;
  return false;
}

export function OpenNowBadge({ label }: { label: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(isOpenNow());
  }, []);

  if (!open) return null;

  return (
    <span className="bg-cream mt-3.5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[13.5px] font-semibold text-[#6b6455]">
      <span className="pulse-ring relative h-2 w-2 rounded-full bg-[#2f9e63] text-[#2f9e63]" />
      {label}
    </span>
  );
}
