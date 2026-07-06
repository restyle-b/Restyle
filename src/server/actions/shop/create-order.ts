"use server";

import { randomBytes } from "node:crypto";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Prisma } from "@prisma/client";
import { routing } from "@/i18n/routing";
import { db } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createCheckoutSchema, cartItemsSchema } from "@/lib/checkout/checkout-schema";
import { DELIVERY_FEE_AGOROT } from "@/lib/checkout/shipping";
import { generateOrderNumber } from "@/lib/checkout/order-number";
import { getPaymentProvider } from "@/lib/payments/get-provider";
import { getEffectivePriceAgorot } from "@/lib/shop/pricing";
import { siteConfig } from "@/lib/config";
import { evaluatePromotions, normalizeEmail, type EvalLine } from "@/lib/promotions/evaluate";
import { fetchActiveAutomaticPromotions, fetchCouponRowByCode } from "@/lib/promotions/fetch-promotion-data";

export type CreateOrderResult =
  | { ok: true; orderNumber: string; paymentRedirectUrl: string }
  | { ok: false; error: string };

/**
 * ביטול-מבוקר של הטרנזקציה — נזרק מתוך ה-callback של db.$transaction כדי
 * ש-Prisma יבצע rollback אוטומטי (שום כתיבה לא מתחייבת), ונתפס מיד בחוץ
 * כדי להחזיר הודעת שגיאה ידידותית ללקוח במקום להיפיל את הפעולה.
 */
class CheckoutAbortError extends Error {}

/**
 * יצירת הזמנה + פתיחת תשלום. **נקודת האמת היחידה לחישוב מחיר** — הקליינט
 * שולח רק {productId, quantity}[] (+ קוד קופון אופציונלי כמחרוזת בלבד),
 * לעולם לא מחיר/שם/subtotal/הנחה. ראה docs/features/shop.md §זרימת Checkout,
 * docs/features/platform-upgrade/promotion-engine.md §4-§5 ו-
 * .claude/skills/tranzila-payments/SKILL.md.
 *
 * כל יצירת ההזמנה (כולל הערכת מבצעים/קופון ומימוש הקופון) קורית בתוך
 * טרנזקציה אינטראקטיבית אחת (§4) — כדי שהחישוב האוטוריטטיבי יקרה בדיוק פעם
 * אחת, ושמימוש קופון (CouponRedemption + usedCount) יהיה אטומי עם ההזמנה
 * עצמה. פתיחת התשלום מול הספק (HTTP חיצוני) קורית **אחרי** ה-commit,
 * בכוונה מחוץ לטרנזקציה (§0) — לא רוצים להחזיק טרנזקציית DB פתוחה על פני
 * קריאת רשת חיצונית.
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

  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const userId = authData.user?.id ?? null;

  const orderNumber = await generateOrderNumber();
  const guestLookupToken = userId ? null : randomBytes(24).toString("base64url");
  const provider = process.env.PAYMENT_PROVIDER === "tranzila" ? "tranzila" : "mock";
  const trimmedCouponCode = parsedForm.data.couponCode?.trim() || null;
  // customerKey = email מנורמל, לאורח ולרשום כאחד (§5.6) — אותה נורמליזציה
  // בדיוק כמו ה-evaluator, כדי שספירת perCustomerLimit תמיד תתאים.
  const emailNormalized = normalizeEmail(parsedForm.data.customerEmail);

  let committedOrder: { id: string; orderNumber: string; totalAgorot: number };

  try {
    committedOrder = await db.$transaction(async (tx) => {
      // --- 1. חישוב מחיר בשרת בלבד — קריאה חיה למוצרים פעילים (כבר קיים, עכשיו בתוך tx) ---
      const productIds = parsedCart.data.map((i) => i.productId);
      const products = await tx.product.findMany({
        // publishAt עתידי = "מתוזמן" — לא ניתן לרכישה גם דרך POST ישיר (Phase 15).
        where: {
          id: { in: productIds },
          active: true,
          available: true,
          OR: [{ publishAt: null }, { publishAt: { lte: new Date() } }],
        },
      });
      const productsById = new Map(products.map((p) => [p.id, p]));

      const orderItemsData: {
        productId: string;
        nameHeSnapshot: string;
        unitPriceAgorot: number;
        quantity: number;
        lineTotalAgorot: number;
        categoryId: string | null;
      }[] = [];

      for (const line of parsedCart.data) {
        const product = productsById.get(line.productId);
        if (!product) {
          throw new CheckoutAbortError(t("productUnavailable"));
        }
        if (product.stock < line.quantity) {
          throw new CheckoutAbortError(t("insufficientStock", { name: product.nameHe }));
        }
        const unitPriceAgorot = getEffectivePriceAgorot(product.priceAgorot, product.salePriceAgorot);
        orderItemsData.push({
          productId: product.id,
          nameHeSnapshot: product.nameHe,
          unitPriceAgorot,
          quantity: line.quantity,
          lineTotalAgorot: unitPriceAgorot * line.quantity,
          categoryId: product.categoryId,
        });
      }

      const shippingFeeAgorot = parsedForm.data.deliveryMethod === "DELIVERY" ? DELIVERY_FEE_AGOROT : 0;
      const now = new Date();

      // --- 2. re-fetch קופון (אם נשלח) + מבצעים אוטומטיים פעילים ---
      const automaticPromotions = await fetchActiveAutomaticPromotions(tx, now);

      let couponRow: Awaited<ReturnType<typeof fetchCouponRowByCode>> = null;
      let couponTotalUsed = 0;
      let couponPerCustomerUsed = 0;

      if (trimmedCouponCode) {
        const initialLookup = await fetchCouponRowByCode(tx, trimmedCouponCode);
        if (!initialLookup) {
          // קוד לא קיים בכלל ב-DB — evaluatePromotions לא מייצר rejection עבור
          // "אין קופון" (זה תפקידנו כאן, כדי לא ליפול בשקט למחיר מלא, §5).
          throw new CheckoutAbortError(t("couponNotFound"));
        }

        // --- 3. נעילת שורת הקופון *לפני* קריאת usedCount/ספירת מימושים (§4) ---
        await tx.$queryRaw`SELECT id FROM coupons WHERE id = ${initialLookup.id} FOR UPDATE`;

        // קריאה חוזרת תחת הנעילה — מגינה מפני שינוי concurrent (למשל השבתת
        // הקופון ע"י אדמין) בין הקריאה הראשונה (לפני הנעילה) לבין קבלתה.
        couponRow = await fetchCouponRowByCode(tx, trimmedCouponCode);
        if (!couponRow) {
          throw new CheckoutAbortError(t("couponNotFound"));
        }

        const couponId = couponRow.id;
        [couponTotalUsed, couponPerCustomerUsed] = await Promise.all([
          tx.couponRedemption.count({ where: { couponId } }),
          tx.couponRedemption.count({ where: { couponId, customerEmailNormalized: emailNormalized } }),
        ]);
      }

      // --- 4. הערכה טהורה (evaluate.ts) ---
      const evalLines: EvalLine[] = orderItemsData.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPriceAgorot: item.unitPriceAgorot,
        categoryId: item.categoryId,
      }));

      const evalResult = evaluatePromotions({
        lines: evalLines,
        automaticPromotions,
        coupon: couponRow,
        now,
        customer: { emailNormalized, userId },
        shipping: { method: parsedForm.data.deliveryMethod, feeAgorot: shippingFeeAgorot },
        usage: couponRow ? { couponTotalUsed, couponPerCustomerUsed } : null,
      });

      // --- 5. hard-fail: קופון שנשלח ונדחה => כל הצ'קאאוט נכשל, אין הזמנה (§5) ---
      // (automaticPromotions לעולם לא מייצרים rejection ב-evaluate.ts — כל
      // rejection כאן שייך בהכרח לקופון שהלקוח שלח.)
      if (trimmedCouponCode && evalResult.rejections.length > 0) {
        throw new CheckoutAbortError(evalResult.rejections[0]?.reason ?? t("couponInvalid"));
      }

      const couponActuallyApplied = couponRow !== null && evalResult.rejections.length === 0;

      // --- 6. בניית שדות ההזמנה הסופיים (net-of-discount) ---
      const appliedPromotionsSnapshot: Prisma.InputJsonValue = evalResult.appliedPromotions.map((p) => ({
        id: p.id,
        name: p.name,
        kind: p.kind,
        amountAgorot: p.amountAgorot,
      }));

      const orderItemsCreateData = orderItemsData.map((item, index) => ({
        productId: item.productId,
        nameHeSnapshot: item.nameHeSnapshot,
        unitPriceAgorot: item.unitPriceAgorot,
        quantity: item.quantity,
        lineTotalAgorot: item.lineTotalAgorot,
        lineDiscountAgorot: evalResult.lineDiscounts[index]?.lineDiscountAgorot ?? 0,
      }));

      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          customerName: parsedForm.data.customerName,
          customerEmail: parsedForm.data.customerEmail,
          customerPhone: parsedForm.data.customerPhone,
          deliveryMethod: parsedForm.data.deliveryMethod,
          shippingAgorot: evalResult.shippingAgorot,
          addressLine: parsedForm.data.addressLine || null,
          addressCity: parsedForm.data.addressCity || null,
          addressNotes: parsedForm.data.addressNotes || null,
          subtotalAgorot: evalResult.subtotalAgorot,
          totalAgorot: evalResult.totalAgorot,
          discountAgorot: evalResult.discountAgorot,
          appliedCouponCode: couponActuallyApplied ? couponRow!.code : null,
          appliedPromotions: appliedPromotionsSnapshot,
          freeShipping: evalResult.freeShipping,
          paymentProvider: provider,
          guestLookupToken,
          items: { create: orderItemsCreateData },
          // רשומת פתיחה בהיסטוריית הסטטוס — כל הזמנה נולדת PENDING.
          statusEvents: { create: { toStatus: "PENDING", changedBy: "system" } },
        },
      });

      // --- 7. מימוש הקופון — אטומי עם יצירת ההזמנה (§4) ---
      if (couponActuallyApplied && couponRow) {
        const couponDiscountAgorot =
          evalResult.appliedPromotions.find((p) => p.code === couponRow!.code)?.amountAgorot ?? 0;
        try {
          await tx.couponRedemption.create({
            data: {
              couponId: couponRow.id,
              orderId: order.id,
              userId,
              customerEmailNormalized: emailNormalized,
              discountAgorot: couponDiscountAgorot,
            },
          });
        } catch (err) {
          // orderId @unique על CouponRedemption = backstop לדאבל-סאבמיט (§5.8).
          if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
            throw new CheckoutAbortError(t("invalidInput"));
          }
          throw err;
        }
        await tx.coupon.update({ where: { id: couponRow.id }, data: { usedCount: { increment: 1 } } });
      }

      return { id: order.id, orderNumber: order.orderNumber, totalAgorot: order.totalAgorot };
    });
  } catch (err) {
    if (err instanceof CheckoutAbortError) {
      return { ok: false, error: err.message };
    }
    console.error("[checkout] createOrder transaction failed", err);
    return { ok: false, error: t("invalidInput") };
  }

  // --- 8. אחרי commit ההזמנה: פתיחת תשלום מול הספק (סכום נטו-מהנחה) ---
  const localePrefix = resolvedLocale === routing.defaultLocale ? "" : `/${resolvedLocale}`;
  const successUrl = `${siteConfig.url}${localePrefix}/checkout/success?order=${committedOrder.orderNumber}`;
  const cancelUrl = `${siteConfig.url}${localePrefix}/checkout/cancel?order=${committedOrder.orderNumber}`;

  try {
    const paymentProvider = getPaymentProvider();
    const checkout = await paymentProvider.createCheckout({
      orderId: committedOrder.id,
      orderNumber: committedOrder.orderNumber,
      amountAgorot: committedOrder.totalAgorot,
      customerEmail: parsedForm.data.customerEmail,
      customerName: parsedForm.data.customerName,
      locale: resolvedLocale,
      returnUrls: { success: successUrl, cancel: cancelUrl },
    });

    await db.payment.create({
      data: {
        orderId: committedOrder.id,
        provider,
        amountAgorot: committedOrder.totalAgorot,
        externalRef: checkout.providerRef,
      },
    });

    return {
      ok: true,
      orderNumber: committedOrder.orderNumber,
      paymentRedirectUrl: checkout.redirectUrl,
    };
  } catch (err) {
    console.error("[checkout] createCheckout failed for order", committedOrder.orderNumber, err);
    return { ok: false, error: t("paymentInitFailed") };
  }
}
