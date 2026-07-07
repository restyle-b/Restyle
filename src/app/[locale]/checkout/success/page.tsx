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

// תלוי ב-DB query לפי orderNumber מה-URL בכל בקשה — לא ניתן לרינדור סטטי.
export const dynamic = "force-dynamic";

/**
 * עמוד תוצאה אחרי חזרה מהתשלום. **לא "מסמן" שום דבר** — רק מציג את הסטטוס
 * האמיתי מה-DB (ראה docs/features/shop.md §עמודים ציבוריים). מציג רק שדות
 * לא-רגישים (מספר הזמנה+סטטוס) כדי לא לחשוף PII למי שמנחש מספר הזמנה.
 */
export default async function CheckoutSuccessPage({
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

  let titleKey: "success.title" | "processing.title" | "cancel.title" | "notFound.title";
  let descriptionKey:
    | "success.description"
    | "processing.description"
    | "cancel.description"
    | "notFound.description";

  if (!order) {
    titleKey = "notFound.title";
    descriptionKey = "notFound.description";
  } else if (order.status === "PAID" || order.status === "FULFILLED" || order.status === "COMPLETED") {
    titleKey = "success.title";
    descriptionKey = "success.description";
  } else if (order.status === "PENDING") {
    titleKey = "processing.title";
    descriptionKey = "processing.description";
  } else {
    titleKey = "cancel.title";
    descriptionKey = "cancel.description";
  }

  return (
    <Container className="py-20 text-center">
      <SectionHeading light center title={t(titleKey)} description={t(descriptionKey)} />

      {order && (
        <p className="mt-6 text-neutral-300">
          {t("success.orderNumberLabel")}: <span className="font-medium text-white">{order.orderNumber}</span>
        </p>
      )}

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link href="/shop" className={cn(buttonVariants({ size: "lg", variant: "light" }))}>
          {t("success.backToShop")}
        </Link>
        <Link href="/account/orders" className={cn(buttonVariants({ size: "lg", variant: "outline" }))}>
          {t("success.viewOrders")}
        </Link>
      </div>
    </Container>
  );
}
