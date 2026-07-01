"use server";

import { z } from "zod";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { db } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import type { OrderDetailData } from "@/components/shop/order-detail-card";

export type LookupOrderResult = { ok: true; order: OrderDetailData } | { ok: false; error: string };

/**
 * חיפוש הזמנה לאורח — דורש orderNumber+guestLookupToken ביחד (לא מספיק
 * להכיר רק את מספר ההזמנה כדי למנוע אנומרציה/IDOR). לא חושף אם ה-orderNumber
 * קיים אך ה-token שגוי — אותה הודעת שגיאה גנרית בשני המקרים.
 */
export async function lookupOrder(input: unknown, locale: string): Promise<LookupOrderResult> {
  const resolvedLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const t = await getTranslations({ locale: resolvedLocale, namespace: "orders.lookup" });

  const ip = await getClientIp();
  if (!rateLimit(`order-lookup:${ip}`, 10, 60_000).ok) {
    return { ok: false, error: t("errors.rateLimited") };
  }

  const schema = z.object({
    orderNumber: z.string().trim().min(1, t("errors.orderNumberRequired")).max(20),
    guestLookupToken: z.string().trim().min(1, t("errors.tokenRequired")).max(64),
  });
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? t("notFound") };
  }

  const order = await db.order.findUnique({
    where: { orderNumber: parsed.data.orderNumber },
    include: { items: true, payment: true },
  });

  if (!order || !order.guestLookupToken || order.guestLookupToken !== parsed.data.guestLookupToken) {
    return { ok: false, error: t("notFound") };
  }

  return {
    ok: true,
    order: {
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
    },
  };
}
