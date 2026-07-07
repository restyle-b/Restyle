"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

/**
 * כניסה לאזור האישי — מפנה ל-/account תמיד; ה-middleware מפנה משם
 * ל-/login?next=/account אם המשתמש לא מחובר, כך שאותו קישור משמש גם
 * כ"התחברות" וגם כ"אזור אישי" בלי לנהל מצב auth בצד הלקוח.
 *
 * pill עם אייקון + תווית — לא עוד אייקון גלמי בלי הסבר (בקשת המשתמש: "כפתור
 * אזור אישי ברור"). התווית מוסתרת מתחת ל-lg כדי לא לצופף את שאר הכותרת
 * ב-tablet; ה-aria-label נשאר קבוע בכל הרוחבים כדי שהשם הנגיש לא ישתנה.
 */
export function AccountNavLink({ className }: { className?: string }) {
  const t = useTranslations("nav");

  return (
    <Link
      href="/account"
      aria-label={t("accountAria")}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-full border border-current/30 px-3 text-neutral-300 transition-colors hover:border-current hover:bg-current/10 hover:text-white lg:px-4",
        className,
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 shrink-0"
        aria-hidden="true"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
      <span className="hidden text-sm font-medium whitespace-nowrap lg:inline">{t("account")}</span>
    </Link>
  );
}
