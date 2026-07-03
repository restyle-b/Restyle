"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type SaveResult = { ok: true } | { ok: false; error: string };

/**
 * תא טבלה עם עריכה inline — לחיצה הופכת לשדה קלט, Enter/blur שומרים,
 * Escape מבטל. משמש למחיר/מלאי בטבלת המוצרים (לא שדות רב-לשוניים —
 * אלה נשארים ב-Sheet של פרטים מלאים).
 */
export function InlineEditableCell({
  value,
  displayValue,
  onSave,
  ariaLabel,
  inputMode = "decimal",
  className,
}: {
  value: string;
  displayValue: React.ReactNode;
  onSave: (raw: string) => Promise<SaveResult>;
  ariaLabel: string;
  inputMode?: "decimal" | "numeric";
  className?: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [pending, setPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  async function commit() {
    if (draft === value) {
      setEditing(false);
      return;
    }
    setPending(true);
    const result = await onSave(draft);
    setPending(false);
    if (result.ok) {
      setEditing(false);
      router.refresh();
    } else {
      toast.error(result.error);
      setDraft(value);
      setEditing(false);
    }
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        inputMode={inputMode}
        value={draft}
        disabled={pending}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            inputRef.current?.blur();
          } else if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
        aria-label={ariaLabel}
        className={cn(
          "w-full max-w-24 rounded-md border border-accent bg-ink px-2 py-1 text-sm text-white focus:outline-none",
          pending && "opacity-60",
          className,
        )}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      className={cn(
        "rounded-md px-2 py-1 text-start text-sm text-white transition-colors hover:bg-white/10",
        className,
      )}
    >
      {displayValue}
    </button>
  );
}
