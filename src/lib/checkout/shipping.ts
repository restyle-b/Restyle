import type { Prisma, PrismaClient } from "@prisma/client";

/** ברירת מחדל (fallback) אם עדיין אין שורת SiteSettings — 40₪ שטוח. איסוף עצמי = 0. */
export const DELIVERY_FEE_AGOROT = 4000;

/**
 * דמי משלוח בפועל — מה-SiteSettings (Phase 18 / M6) אם השורה קיימת, אחרת
 * הקבוע למעלה. מקבל client גנרי (db רגיל או tx בתוך טרנזקציה), כדי שאותו
 * קוד ישרת גם את create-order (בתוך tx) וגם את preview הלא-אוטוריטטיבי (db).
 */
export async function getShippingFeeAgorot(
  client: Pick<PrismaClient | Prisma.TransactionClient, "siteSettings">,
): Promise<number> {
  const settings = await client.siteSettings.findUnique({ where: { id: 1 }, select: { shippingFeeAgorot: true } });
  return settings?.shippingFeeAgorot ?? DELIVERY_FEE_AGOROT;
}
