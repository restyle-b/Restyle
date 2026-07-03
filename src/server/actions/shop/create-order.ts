"use server";

import { randomBytes } from "node:crypto";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { db } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createCheckoutSchema, cartItemsSchema } from "@/lib/checkout/checkout-schema";
import { DELIVERY_FEE_AGOROT } from "@/lib/checkout/shipping";
import { generateOrderNumber } from "@/lib/checkout/order-number";
import { getPaymentProvider } from "@/lib/payments/get-provider";
import { siteConfig } from "@/lib/config";

export type CreateOrderResult =
  | { ok: true; orderNumber: string; paymentRedirectUrl: string }
  | { ok: false; error: string };

/**
 * יצירת הזמנה + פתיחת תשלום. **נקודת האמת היחידה לחישוב מחיר** — הקליינט
 * שולח רק {productId, quantity}[], לעולם לא מחיר/שם/subtotal. ראה
 * docs/features/shop.md §זרימת Checkout ו-.claude/skills/tranzila-payments/SKILL.md.
 */
export async function createOrder(
  formInput: unknown,
  cartInput: unknown,
  locale: string,
): Promise<CreateOrderResult> {
  const resolvedLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const t = await getTranslations({ locale: resolvedLocale, namespace: "checkout.errors" });

  const ip = await getClientIp();
  if (!rateLimit(`checkout:${ip}`, 5, 60_000).ok) {
    return { ok: false, error: t("rateLimited") };
  }

  const checkoutSchema = createCheckoutSchema({
    nameTooShort: t("nameTooShort"),
    emailInvalid: t("emailInvalid"),
    phoneTooShort: t("phoneTooShort"),
    addressRequired: t("addressRequired"),
    cityRequired: t("cityRequired"),
  });
  const parsedForm = checkoutSchema.safeParse(formInput);
  if (!parsedForm.success) {
    return { ok: false, error: parsedForm.error.issues[0]?.message ?? t("invalidInput") };
  }
  // honeypot מלא => התעלמות שקטה (לא לחשוף למנגנון לבוטים)
  if (parsedForm.data.company) {
    return { ok: false, error: t("invalidInput") };
  }

  const parsedCart = cartItemsSchema.safeParse(cartInput);
  if (!parsedCart.success) {
    return { ok: false, error: t("emptyCart") };
  }

  // חישוב מחיר בשרת בלבד — קריאה חיה למוצרים פעילים, לא סומכים על שום דבר מהקליינט.
  const productIds = parsedCart.data.map((i) => i.productId);
  const products = await db.product.findMany({
    where: { id: { in: productIds }, active: true },
  });
  const productsById = new Map(products.map((p) => [p.id, p]));

  const orderItemsData: {
    productId: string;
    nameHeSnapshot: string;
    unitPriceAgorot: number;
    quantity: number;
    lineTotalAgorot: number;
  }[] = [];
  let subtotalAgorot = 0;

  for (const line of parsedCart.data) {
    const product = productsById.get(line.productId);
    if (!product) {
      return { ok: false, error: t("productUnavailable") };
    }
    if (product.stock < line.quantity) {
      return { ok: false, error: t("insufficientStock", { name: product.nameHe }) };
    }
    const lineTotal = product.priceAgorot * line.quantity;
    subtotalAgorot += lineTotal;
    orderItemsData.push({
      productId: product.id,
      nameHeSnapshot: product.nameHe,
      unitPriceAgorot: product.priceAgorot,
      quantity: line.quantity,
      lineTotalAgorot: lineTotal,
    });
  }

  const shippingAgorot = parsedForm.data.deliveryMethod === "DELIVERY" ? DELIVERY_FEE_AGOROT : 0;
  const totalAgorot = subtotalAgorot + shippingAgorot;

  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id ?? null;

  const orderNumber = await generateOrderNumber();
  const guestLookupToken = userId ? null : randomBytes(24).toString("base64url");

  const provider = process.env.PAYMENT_PROVIDER === "tranzila" ? "tranzila" : "mock";

  const order = await db.order.create({
    data: {
      orderNumber,
      userId,
      customerName: parsedForm.data.customerName,
      customerEmail: parsedForm.data.customerEmail,
      customerPhone: parsedForm.data.customerPhone,
      deliveryMethod: parsedForm.data.deliveryMethod,
      shippingAgorot,
      addressLine: parsedForm.data.addressLine || null,
      addressCity: parsedForm.data.addressCity || null,
      addressNotes: parsedForm.data.addressNotes || null,
      subtotalAgorot,
      totalAgorot,
      paymentProvider: provider,
      guestLookupToken,
      items: { create: orderItemsData },
      // רשומת פתיחה בהיסטוריית הסטטוס — כל הזמנה נולדת PENDING.
      statusEvents: { create: { toStatus: "PENDING", changedBy: "system" } },
    },
  });

  const localePrefix = resolvedLocale === routing.defaultLocale ? "" : `/${resolvedLocale}`;
  const successUrl = `${siteConfig.url}${localePrefix}/checkout/success?order=${order.orderNumber}`;
  const cancelUrl = `${siteConfig.url}${localePrefix}/checkout/cancel?order=${order.orderNumber}`;

  try {
    const paymentProvider = getPaymentProvider();
    const checkout = await paymentProvider.createCheckout({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amountAgorot: totalAgorot,
      customerEmail: parsedForm.data.customerEmail,
      customerName: parsedForm.data.customerName,
      locale: resolvedLocale,
      returnUrls: { success: successUrl, cancel: cancelUrl },
    });

    await db.payment.create({
      data: {
        orderId: order.id,
        provider,
        amountAgorot: totalAgorot,
        externalRef: checkout.providerRef,
      },
    });

    return {
      ok: true,
      orderNumber: order.orderNumber,
      paymentRedirectUrl: checkout.redirectUrl,
    };
  } catch (err) {
    console.error("[checkout] createCheckout failed for order", order.orderNumber, err);
    return { ok: false, error: t("paymentInitFailed") };
  }
}
