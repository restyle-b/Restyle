import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { getContentOverrides, mergeContentOverrides } from "@/lib/content/get-content-overrides";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  const messages = (await import(`../../messages/${locale}.json`)).default;
  // עריכת תוכן מ-Admin (ContentBlock, Phase 8.4) ממוזגת כאן — כך שכל t()/
  // useTranslations קיים בכל האתר מקבל אוטומטית את הטקסט המעודכן בלי לשנות
  // קומפוננטות. נכשל בשקט ל-messages הסטטי אם ה-DB לא נגיש.
  const overrides = await getContentOverrides(locale);

  return {
    locale,
    messages: mergeContentOverrides(messages, overrides),
  };
});
