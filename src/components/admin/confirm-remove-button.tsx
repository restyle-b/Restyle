"use client";

import { useState } from "react";

/**
 * כפתור הסרה עם אישור דו-שלבי inline — מונע מחיקה בשוגג בטפסי
 * useFieldArray (הסרת שורה + "שמירה" מוחקת לצמיתות בלי אזהרה קודמת).
 */
export function ConfirmRemoveButton({ onRemove, label = "הסרה" }: { onRemove: () => void; label?: string }) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <span className="flex items-center gap-3 text-sm">
        <button type="button" onClick={onRemove} className="font-medium text-red-400 hover:text-red-300">
          לאישור ההסרה — לחצו שוב
        </button>
        <button type="button" onClick={() => setConfirming(false)} className="text-neutral-400 hover:text-white">
          ביטול
        </button>
      </span>
    );
  }

  return (
    <button type="button" onClick={() => setConfirming(true)} className="text-sm text-red-400 hover:text-red-300">
      {label}
    </button>
  );
}
