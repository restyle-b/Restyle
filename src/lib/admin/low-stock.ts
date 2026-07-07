import { db } from "@/lib/db";
import { LOW_STOCK_THRESHOLD } from "@/lib/admin/product-schema";

/**
 * סף "מלאי נמוך" בפועל — נקרא מ-SiteSettings (Phase 17 / M5, שורת singleton
 * id=1) אם השורה קיימת, אחרת נופל בחזרה לקבוע LOW_STOCK_THRESHOLD
 * (product-schema.ts). אותה קונבנציה בדיוק כמו getShippingFeeAgorot
 * ב-lib/checkout/shipping.ts (Phase 18 / M6) — קבוע ה-fallback נשאר, השדה
 * ב-DB הוא מקור האמת ברגע שהאדמין שינה אותו במסך ההגדרות.
 *
 * קובץ נפרד מ-product-schema.ts בכוונה: product-schema.ts מיובא גם מקומפוננטות
 * client (products-table.tsx, stock-health-badge.tsx) — ייבוא `db`/Prisma
 * לשם היה שובר את חבילת ה-client. הפונקציה הזו נקראת רק משרת (server actions
 * / server components תחת /admin, המוגנים כבר ב-requireAdmin ברמת ה-layout).
 */
export async function getLowStockThreshold(): Promise<number> {
  const settings = await db.siteSettings.findUnique({ where: { id: 1 }, select: { lowStockThreshold: true } });
  return settings?.lowStockThreshold ?? LOW_STOCK_THRESHOLD;
}
