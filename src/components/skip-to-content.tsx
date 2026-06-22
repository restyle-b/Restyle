import { useTranslations } from "next-intl";

/** קישור "דלג לתוכן" — נחשף בעת ניווט מקלדת (חובת נגישות). */
export function SkipToContent() {
  const t = useTranslations("skipToContent");
  return (
    <a href="#main" className="skip-to-content">
      {t("text")}
    </a>
  );
}
