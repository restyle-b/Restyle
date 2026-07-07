import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/section-heading";
import { Link } from "@/i18n/navigation";
import { EnrollmentStatusBadge } from "@/components/courses/enrollment-status-badge";
import { PayBalanceButton } from "@/components/courses/pay-balance-button";
import { formatAgorot } from "@/lib/format";
import { getCurrentUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "academyCommerce.myCourses" });
  return { title: t("title") };
}

export const dynamic = "force-dynamic";

export default async function AccountCoursesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "academyCommerce" });
  const tOrders = await getTranslations({ locale, namespace: "orders" });

  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/account/courses");
  }

  const enrollments = await db.enrollment.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <SectionHeading light eyebrow={t("myCourses.title")} title={t("myCourses.title")} />

      {enrollments.length === 0 ? (
        <p className="mt-10 text-neutral-400">{t("myCourses.empty")}</p>
      ) : (
        <div className="mt-10 space-y-3">
          {enrollments.map((e) => {
            const balance = e.coursePriceAgorot - e.amountPaidAgorot;
            return (
              <div
                key={e.id}
                className="rounded-lg border border-line-dark bg-ink-soft p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{e.courseNameHeSnapshot}</p>
                    <p className="text-sm text-neutral-400">
                      {e.enrollmentNumber} · {new Date(e.createdAt).toLocaleDateString(locale)}
                    </p>
                  </div>
                  <EnrollmentStatusBadge status={e.status} />
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
                  <span className="text-neutral-300">
                    {t("myCourses.amountPaidLabel")}: {formatAgorot(e.amountPaidAgorot, locale)} /{" "}
                    {formatAgorot(e.coursePriceAgorot, locale)}
                  </span>
                  {e.status === "DEPOSIT_PAID" && balance > 0 ? (
                    <span className="flex items-center gap-3">
                      <span className="text-accent">
                        {t("balance.dueLabel")}: {formatAgorot(balance, locale)}
                      </span>
                      <PayBalanceButton enrollmentNumber={e.enrollmentNumber} />
                    </span>
                  ) : e.status === "PAID" ? (
                    <span className="text-green-400">{t("balance.paidInFull")}</span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Link href="/account" className="mt-10 inline-block text-sm text-neutral-400 hover:text-white">
        {tOrders("backToAccount")}
      </Link>
    </>
  );
}
