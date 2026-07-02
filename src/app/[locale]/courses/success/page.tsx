import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/section-heading";
import { Link } from "@/i18n/navigation";
import { formatAgorot } from "@/lib/format";
import { db } from "@/lib/db";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "academyCommerce.success" });
  return { title: t("title") };
}

export const dynamic = "force-dynamic";

/** מציג את סטטוס ההרשמה מה-DB בלבד — לא "מסמן" כלום. */
export default async function CourseSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ enrollment?: string }>;
}) {
  const { locale } = await params;
  const { enrollment: enrollmentNumber } = await searchParams;
  const t = await getTranslations({ locale, namespace: "academyCommerce" });

  const enrollment = enrollmentNumber
    ? await db.enrollment.findUnique({
        where: { enrollmentNumber },
        select: {
          enrollmentNumber: true,
          status: true,
          coursePriceAgorot: true,
          amountPaidAgorot: true,
        },
      })
    : null;

  let titleKey: string;
  let description: string;
  if (!enrollment) {
    titleKey = "notFound.title";
    description = t("notFound.description");
  } else if (enrollment.status === "PAID") {
    titleKey = "success.title";
    description = t("success.descriptionFull");
  } else if (enrollment.status === "DEPOSIT_PAID") {
    titleKey = "success.title";
    description = t("success.descriptionDeposit");
  } else if (enrollment.status === "PENDING") {
    titleKey = "success.title";
    description = t("success.processing");
  } else {
    titleKey = "cancel.title";
    description = t("cancel.description");
  }

  const balance = enrollment ? enrollment.coursePriceAgorot - enrollment.amountPaidAgorot : 0;

  return (
    <Container className="py-20 text-center sm:py-28">
      <SectionHeading light center title={t(titleKey)} description={description} />

      {enrollment && (
        <p className="mt-6 text-neutral-300">
          {t("success.enrollmentNumberLabel")}:{" "}
          <span className="font-medium text-white">{enrollment.enrollmentNumber}</span>
        </p>
      )}

      {enrollment?.status === "DEPOSIT_PAID" && balance > 0 && (
        <p className="mt-2 text-neutral-300">
          {t("balance.dueLabel")}: <span className="font-medium text-accent">{formatAgorot(balance, locale)}</span>
        </p>
      )}

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link href="/account/courses" className={cn(buttonVariants({ size: "lg" }))}>
          {t("success.viewMyCourses")}
        </Link>
        <Link href="/academy" className={cn(buttonVariants({ size: "lg", variant: "outline" }))}>
          {t("success.backToAcademy")}
        </Link>
      </div>
    </Container>
  );
}
