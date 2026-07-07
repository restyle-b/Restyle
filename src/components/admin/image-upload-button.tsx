"use client";

import { useRef, useState } from "react";

/**
 * כפתור העלאת תמונה לאדמין — שולח ל-/api/admin/upload ומחזיר URL ציבורי
 * דרך onUploaded (הטופס שומר את ה-URL בשדה imageUrl הקיים).
 */
export function ImageUploadButton({ onUploaded }: { onUploaded: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // מאפשר לבחור שוב את אותו קובץ
    if (!file) return;

    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const result = (await response.json()) as { ok: boolean; url?: string; error?: string };
      if (result.ok && result.url) {
        onUploaded(result.url);
      } else {
        setError(result.error ?? "ההעלאה נכשלה");
      }
    } catch {
      setError("ההעלאה נכשלה — בדקו את החיבור ונסו שוב");
    } finally {
      setUploading(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={onFileChange}
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="rounded-md border border-line-dark px-3 py-1.5 text-sm text-neutral-300 transition-colors hover:border-accent hover:text-white disabled:opacity-50"
      >
        {uploading ? "מעלה..." : "העלאת תמונה"}
      </button>
      {error && <span className="text-sm text-red-400">{error}</span>}
    </span>
  );
}
