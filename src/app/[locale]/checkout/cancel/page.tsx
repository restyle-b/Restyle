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
  const t = await getTranslations({ locale, namespace: "checkout" });
  return { title: t("metaTitle") };
}

export const dynamic = "force-dynamic";

/**
 * עמוד חזרה אחרי תשלום שבוטל/נכשל. כמו success/page.tsx — מציג את הסטטוס
 * האמיתי מה-DB ולא מניח שהתשלום נכשל רק כי הלקוח נחת כאן (הפניה מהספק
 * יכולה להיות שגויה/מאוחרת).
 */
export default async function CheckoutCancelPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order?: string }>;
}) {
  const { locale } = await params;
  const { order: orderNumber } = await searchParams;
  const t = await getTranslations({ locale, namespace: "checkout" });

  const order = orderNumber
    ? await db.order.findUnique({
        where: { orderNumber },
        select: { orderNumber: true, status: true },
      })
    : null;

  const isPaid =
    order?.status === "PAID" || order?.status === "FULFILLED" || order?.status === "COMPLETED";

  const titleKey = !order ? "notFound.title" : isPaid ? "success.title" : "cancel.title";
  const descriptionKey = !order
    ? "notFound.description"
    : isPaid
      ? "success.description"
      : "cancel.description";

  return (
    <Container className="py-20 text-center">
      <SectionHeading light center title={t(titleKey)} description={t(descriptionKey)} />

      {order && (
        <p className="mt-6 text-neutral-300">
          {t("success.orderNumberLabel")}: <span className="font-medium text-white">{order.orderNumber}</span>
        </p>
      )}

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        {!isPaid && (
          <Link href="/checkout" className={cn(buttonVariants({ size: "lg" }))}>
            {t("cancel.retry")}
          </Link>
        )}
        <Link href="/shop" className={cn(buttonVariants({ size: "lg", variant: "outline" }))}>
          {t("cancel.backToShop")}
        </Link>
      </div>
    </Container>
  );
}
