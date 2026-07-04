import { ChevronLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { EnrollmentStatusBadge } from "@/components/courses/enrollment-status-badge";
import { PayBalanceButton } from "@/components/courses/pay-balance-button";
import { formatAgorot } from "@/lib/format";
import { cn } from "@/lib/utils";
import { db } from "@/lib/db";

/** כרטיס "הקורסים שלי" — ux-spec.md §A2 סעיף 3 (1 col, מקסימום 2 הרשמות). */
export async function CoursesCard({ userId, locale }: { userId: string; locale: string }) {
  const t = await getTranslations({ locale, namespace: "account.dashboard.courses" });
  const tBalance = await getTranslations({ locale, namespace: "academyCommerce.balance" });

  const enrollments = await db.enrollment.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 2,
  });

  return (
    <Card className="lg:order-3">
      <CardHeader>
        <CardTitle className="text-base font-medium text-white">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {enrollments.length === 0 ? (
          <div className="flex flex-col items-start gap-4 py-4">
            <p className="text-sm text-neutral-400">{t("empty")}</p>
            <Link href="/academy" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              {t("emptyCta")}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {enrollments.map((e) => {
              const balance = e.coursePriceAgorot - e.amountPaidAgorot;
              return (
                <div key={e.id} className="rounded-lg border border-line-dark bg-ink/40 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium text-white">{e.courseNameHeSnapshot}</p>
                    <EnrollmentStatusBadge status={e.status} />
                  </div>
                  {e.status === "DEPOSIT_PAID" && balance > 0 ? (
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span className="text-xs text-accent">
                        {tBalance("dueLabel")}: {formatAgorot(balance, locale)}
                      </span>
                      <PayBalanceButton enrollmentNumber={e.enrollmentNumber} />
                    </div>
                  ) : e.status === "PAID" ? (
                    <p className="mt-2 text-xs text-green-400">{tBalance("paidInFull")}</p>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
      {enrollments.length > 0 && (
        <CardFooter>
          <Link
            href="/account/courses"
            className="inline-flex items-center gap-1 text-sm text-neutral-400 transition-colors hover:text-white"
          >
            {t("viewAll")}
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
