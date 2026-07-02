import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/section-heading";
import { Link } from "@/i18n/navigation";
import { db } from "@/lib/db";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "academyCommerce.cancel" });
  return { title: t("title") };
}

export const dynamic = "force-dynamic";

export default async function CourseCancelPage({
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
        select: { status: true, course: { select: { slug: true } } },
      })
    : null;

  // אם התשלום בכל זאת הצליח (הפניה מוקדמת/שגויה) — מציגים הצלחה.
  const isPaid = enrollment?.status === "PAID" || enrollment?.status === "DEPOSIT_PAID";
  const titleKey = !enrollment ? "notFound.title" : isPaid ? "success.title" : "cancel.title";
  const description = !enrollment
    ? t("notFound.description")
    : isPaid
      ? t("success.descriptionDeposit")
      : t("cancel.description");

  return (
    <Container className="py-20 text-center sm:py-28">
      <SectionHeading light center title={t(titleKey)} description={description} />

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        {!isPaid && enrollment?.course?.slug && (
          <Link href={`/academy/${enrollment.course.slug}`} className={cn(buttonVariants({ size: "lg" }))}>
            {t("cancel.retry")}
          </Link>
        )}
        <Link href="/academy" className={cn(buttonVariants({ size: "lg", variant: "outline" }))}>
          {t("cancel.backToAcademy")}
        </Link>
      </div>
    </Container>
  );
}
