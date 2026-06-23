"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/**
 * Segmented control תואם ל-`<ThemeToggle>` (pill מעוגל, אופציה פעילה ממולאת) —
 * כדי שלא יעמוד לידו `<select>` גנרי של הדפדפן שמבליט חוסר עקביות עיצובית.
 */
export function LocaleSwitcher({ className }: { className?: string }) {
  const t = useTranslations("localeSwitcher");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      role="group"
      aria-label={t("label")}
      className={cn(
        "border-current/30 text-current inline-flex items-center rounded-full border p-0.5",
        className,
      )}
    >
      {routing.locales.map((loc) => {
        const isActive = loc === locale;
        return (
          <button
            key={loc}
            type="button"
            onClick={() => router.replace(pathname, { locale: loc })}
            aria-pressed={isActive}
            title={t(loc)}
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide transition-colors",
              isActive
                ? "bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)]"
                : "opacity-65 hover:opacity-100",
            )}
          >
            {loc}
          </button>
        );
      })}
    </div>
  );
}
