"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import type { InventoryReason } from "@prisma/client";
import { getProductInventoryHistory, type InventoryHistoryEvent } from "@/server/actions/admin/products";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const REASON_LABEL: Record<InventoryReason, string> = {
  SALE: "מכירה",
  RESTOCK: "חידוש מלאי",
  MANUAL_ADJUST: "תיקון ידני",
  ORDER_CANCELLED: "ביטול הזמנה",
};

// אותה קונבנציה בדיוק כמו actorLabel ב-activity-timeline.tsx / changedByLabel
// ב-status-history.tsx — "payment" הוא actorEmail פנימי שנכתב ע"י
// handle-payment-result.ts, לא אימייל אמיתי.
function actorLabel(actorEmail: string | null): string {
  if (actorEmail === "payment") return "תשלום (אוטומטי)";
  if (!actorEmail || actorEmail === "system") return "מערכת";
  return actorEmail;
}

function formatDelta(delta: number): string {
  return delta > 0 ? `+${delta}` : `${delta}`;
}

type Product = { id: string; nameHe: string };

/**
 * מגירת "היסטוריית מלאי" למוצר בודד — נטענת lazily (getProductInventoryHistory,
 * server action) רק כשנפתחת, כדי לא לטעון יומן מלא עבור כל שורה בטבלת
 * המוצרים. עד 200 אירועים אחרונים, מהחדש לישן (ראו ה-server action).
 */
export function ProductInventoryHistorySheet({
  open,
  onOpenChange,
  product,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}) {
  const [events, setEvents] = useState<InventoryHistoryEvent[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !product) return;
    let cancelled = false;
    setLoading(true);
    setEvents(null);

    getProductInventoryHistory(product.id)
      .then((rows) => {
        if (!cancelled) setEvents(rows);
      })
      .catch(() => {
        if (!cancelled) toast.error("טעינת היסטוריית המלאי נכשלה");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, product]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>היסטוריית מלאי{product ? ` — ${product.nameHe}` : ""}</SheetTitle>
          <SheetDescription>עד 200 האירועים האחרונים, מהחדש לישן.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {loading && <p className="py-10 text-center text-sm text-neutral-400">טוען...</p>}

          {!loading && events && events.length === 0 && (
            <p className="py-10 text-center text-sm text-neutral-400">אין תנועות מלאי רשומות עבור מוצר זה עדיין.</p>
          )}

          {!loading && events && events.length > 0 && (
            <ol className="space-y-3">
              {events.map((event) => (
                <li key={event.id} className="rounded-lg border border-line-dark p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge tone="outline">{REASON_LABEL[event.reason]}</Badge>
                    <span
                      className={cn(
                        "text-sm font-semibold [direction:ltr] [font-variant-numeric:tabular-nums]",
                        event.delta > 0 && "text-green-400",
                        event.delta < 0 && "text-red-400",
                        event.delta === 0 && "text-neutral-400",
                      )}
                    >
                      {formatDelta(event.delta)}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-neutral-500">
                    <span>
                      {actorLabel(event.actorEmail)} ·{" "}
                      <span className="[direction:ltr] [font-variant-numeric:tabular-nums]">
                        {new Date(event.createdAt).toLocaleString("he-IL", { dateStyle: "short", timeStyle: "short" })}
                      </span>
                    </span>
                    <span>
                      מלאי לאחר:{" "}
                      <span className="font-medium text-neutral-300 [font-variant-numeric:tabular-nums]">
                        {event.resultingStock}
                      </span>
                    </span>
                  </div>

                  {event.note && <p className="mt-1.5 text-xs text-neutral-400">{event.note}</p>}

                  {event.orderNumber && (
                    <Link
                      href={`/admin/orders/${event.orderNumber}`}
                      className="mt-1.5 inline-block text-xs text-accent hover:underline"
                    >
                      הזמנה {event.orderNumber} ←
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
