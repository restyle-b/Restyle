import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BookingLink } from "@/components/booking-link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** "פעולות מהירות" — ux-spec.md §A2 סעיף 4 (full width, סטטי, בלי שאילתת DB). */
export async function QuickActionsCard({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "account.dashboard.quickActions" });

  return (
    <Card className="lg:order-5 lg:col-span-3">
      <CardHeader>
        <CardTitle className="text-base font-medium text-white">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <BookingLink className={cn(buttonVariants({ variant: "light", size: "sm" }))}>{t("booking")}</BookingLink>
        <Link href="/shop" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
          {t("shop")}
        </Link>
        <Link href="/academy" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
          {t("courses")}
        </Link>
      </CardContent>
    </Card>
  );
}
