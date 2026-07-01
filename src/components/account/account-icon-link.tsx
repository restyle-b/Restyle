"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/**
 * אייקון כניסה לאזור האישי. מפנה ל-/account תמיד; ה-middleware מפנה משם
 * ל-/login?next=/account אם המשתמש לא מחובר, כך שאותו אייקון משמש גם
 * כ"התחברות" וגם כ"אזור אישי" בלי לנהל מצב auth בצד הלקוח.
 */
export function AccountIconLink({ className }: { className?: string }) {
  const t = useTranslations("nav");

  return (
    <Link
      href="/account"
      aria-label={t("accountAria")}
      className={
        className ??
        "flex h-9 w-9 items-center justify-center rounded-full text-neutral-300 transition-colors hover:bg-current/10 hover:text-white"
      }
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </Link>
  );
}
