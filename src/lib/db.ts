import { PrismaClient } from "@prisma/client";

/**
 * Prisma client כ-singleton (מונע ריבוי חיבורים ב-dev/hot-reload).
 * החיבור עצל — נוצר רק בשאילתה הראשונה (לא בעת import).
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
