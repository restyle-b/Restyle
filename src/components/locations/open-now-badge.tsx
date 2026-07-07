"use client";

import { useEffect, useState } from "react";
import type { OpeningHourRow } from "@/lib/content/get-opening-hours";

/**
 * בודק אם השעה הנוכחית (של המבקר, בזמן אמת בצד הלקוח) נמצאת בתוך שעות
 * הפעילות לפי נתוני ה-DB (dayOrder 0=ראשון, תואם ל-Date.getDay()).
 * מוצג רק אחרי mount כדי למנוע hydration mismatch (השרת לא יודע את
 * השעה המקומית של המבקר).
 */
function isOpenNow(hours: OpeningHourRow[]): boolean {
  const now = new Date();
  const row = hours.find((h) => h.dayOrder === now.getDay());
  if (!row || row.closed || !row.openTime || !row.closeTime) return false;
  const current = now.getHours() * 60 + now.getMinutes();
  const toMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return (h ?? 0) * 60 + (m ?? 0);
  };
  return current >= toMinutes(row.openTime) && current < toMinutes(row.closeTime);
}

export function OpenNowBadge({ label, hours }: { label: string; hours: OpeningHourRow[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(isOpenNow(hours));
  }, [hours]);

  if (!open) return null;

  return (
    <span className="bg-cream mt-3.5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[13.5px] font-semibold text-[#6b6455]">
      <span className="pulse-ring relative h-2 w-2 rounded-full bg-[#2f9e63] text-[#2f9e63]" />
      {label}
    </span>
  );
}
