import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

/**
 * כתיבה ליומן הפעילות המאוחד (ActivityLog). לא "use server" בכוונה — לא
 * endpoint ציבורי; נקרא רק מתוך server actions אחרים שכבר עברו requireAdmin().
 * best-effort: כשל בכתיבת היומן לא אמור להפיל את הפעולה העסקית עצמה.
 */
export async function logActivity(input: {
  actorEmail: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  summary: string;
  metadata?: Prisma.InputJsonValue;
}): Promise<void> {
  try {
    await db.activityLog.create({
      data: {
        actorEmail: input.actorEmail,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        summary: input.summary,
        metadata: input.metadata,
      },
    });
  } catch (err) {
    console.error("[activity-log] failed to write entry:", err);
  }
}
