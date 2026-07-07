import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * "הפרופיל שלך כמעט מוכן" — ux-spec.md §A2 סעיף 2. מוצג רק אם שם/טלפון
 * חסרים; מוסתר לגמרי (לא רק ריק) כשהפרופיל מלא — הקורא בעמוד מדלג על
 * ה-Suspense הזה כי אין בו await, נשען על ה-user שכבר נטען למעלה.
 */
export async function ProfileNudgeCard({
  locale,
  missingName,
  missingPhone,
}: {
  locale: string;
  missingName: boolean;
  missingPhone: boolean;
}) {
  if (!missingName && !missingPhone) return null;

  const t = await getTranslations({ locale, namespace: "account.dashboard.profileNudge" });

  return (
    <Card className="border-accent/60 bg-accent/10 lg:order-2">
      <CardContent className="flex h-full flex-col gap-3 pt-5">
        <div>
          <h3 className="text-base font-medium text-white">{t("title")}</h3>
          <p className="mt-1 text-sm text-neutral-300">{t("description")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {missingName && <Badge tone="outline">{t("missingName")}</Badge>}
          {missingPhone && <Badge tone="outline">{t("missingPhone")}</Badge>}
        </div>
        <Link href="/account/profile" className={cn(buttonVariants({ variant: "light", size: "sm" }), "mt-auto self-start")}>
          {t("cta")}
        </Link>
      </CardContent>
    </Card>
  );
}
