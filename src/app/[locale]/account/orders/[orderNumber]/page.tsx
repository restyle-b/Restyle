import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/section-heading";
import { Link } from "@/i18n/navigation";
import { OrderDetailCard, type OrderDetailData } from "@/components/shop/order-detail-card";
import { getCurrentUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; orderNumber: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "orders.detail" });
  return { title: t("title") };
}

export const dynamic = "force-dynamic";

export default async function AccountOrderDetailPage({
  params,
}: {
  params: Promise<{ locale: string; orderNumber: string }>;
}) {
  const { locale, orderNumber } = await params;
  const t = await getTranslations({ locale, namespace: "orders" });

  // ה-layout כבר מבטיח משתמש מחובר; קריאה נוספת פה רק כדי לקבל את ה-id.
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=/account/orders/${orderNumber}`);
  }

  // בדיקת ownership עצמאית — לא סומכים על כך שרק ההזמנות של המשתמש
  // הגיעו לכאן דרך הרשימה (IDOR defense, כל URL הזמנה ניתן להקלדה ישירה).
  const order = await db.order.findUnique({
    where: { orderNumber },
    include: { items: true, payment: true, statusEvents: { orderBy: { createdAt: "desc" } } },
  });
  if (!order || order.userId !== user.id) {
    notFound();
  }

  const detail: OrderDetailData = {
    orderNumber: order.orderNumber,
    status: order.status,
    createdAt: order.createdAt,
    deliveryMethod: order.deliveryMethod,
    addressLine: order.addressLine,
    addressCity: order.addressCity,
    addressNotes: order.addressNotes,
    subtotalAgorot: order.subtotalAgorot,
    shippingAgorot: order.shippingAgorot,
    totalAgorot: order.totalAgorot,
    items: order.items.map((item) => ({
      id: item.id,
      nameHeSnapshot: item.nameHeSnapshot,
      unitPriceAgorot: item.unitPriceAgorot,
      quantity: item.quantity,
      lineTotalAgorot: item.lineTotalAgorot,
    })),
    payment: order.payment ? { status: order.payment.status, last4: order.payment.last4 } : null,
    statusEvents: order.statusEvents.map((event) => ({
      id: event.id,
      toStatus: event.toStatus,
      createdAt: event.createdAt,
    })),
  };

  return (
    <>
      <SectionHeading light eyebrow={t("detail.title")} title={order.orderNumber} />
      <div className="mt-10 max-w-xl">
        <OrderDetailCard order={detail} />
      </div>
      <Link href="/account/orders" className="mt-10 inline-block text-sm text-neutral-400 hover:text-white">
        {t("backToOrders")}
      </Link>
    </>
  );
}
