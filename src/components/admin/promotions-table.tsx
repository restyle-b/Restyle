"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Promotion } from "@prisma/client";
import { Plus, MoreHorizontal, Pencil, Trash2, Ticket } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PromotionEditSheet } from "@/components/admin/promotion-edit-sheet";
import { deletePromotion, getPromotion, togglePromotionActive } from "@/server/actions/admin/promotions";
import {
  bpToPercentInput,
  agorotToShekelsInput,
  type PromotionDetailsInput,
} from "@/lib/admin/promotion-schema";
import { utcToJerusalemLocal } from "@/lib/admin/product-schema";
import { formatAgorot } from "@/lib/format";
import { cn } from "@/lib/utils";

type PromotionRow = Promotion & {
  _count: { coupons: number; eligibleProducts: number; eligibleCategories: number };
};

const KIND_LABELS: Record<string, string> = {
  PERCENT: "אחוז הנחה",
  FIXED_AMOUNT: "סכום קבוע",
  FREE_SHIPPING: "משלוח חינם",
  BUY_X_GET_Y: "קנה-קבל (בקרוב)",
  CHEAPEST_FREE: "הזול חינם (בקרוב)",
  BUNDLE_PRICE: "מחיר חבילה (בקרוב)",
};

function kindSummary(promotion: PromotionRow, locale: string): string {
  switch (promotion.kind) {
    case "PERCENT":
      return promotion.percentBp ? `${bpToPercentInput(promotion.percentBp)}%` : "—";
    case "FIXED_AMOUNT":
      return promotion.amountAgorot ? formatAgorot(promotion.amountAgorot, locale) : "—";
    case "FREE_SHIPPING":
      return promotion.freeShippingMinSubtotalAgorot
        ? `מעל ${formatAgorot(promotion.freeShippingMinSubtotalAgorot, locale)}`
        : "ללא סף";
    default:
      return "—";
  }
}

type EditingPromotion = PromotionDetailsInput & { id: string };

export function PromotionsTable({ promotions }: { promotions: PromotionRow[] }) {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<EditingPromotion | null>(null);
  const [deletingPromotion, setDeletingPromotion] = useState<PromotionRow | null>(null);

  async function handleDelete() {
    if (!deletingPromotion) return;
    const result = await deletePromotion(deletingPromotion.id);
    if (result.ok) {
      toast.success("המבצע נמחק");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  function handleCreate() {
    setEditingPromotion(null);
    setSheetOpen(true);
  }

  /** נטען מחדש מהשרת (לא רק מה-row בטבלה) — כדי לקבל את מזהי הזכאות המלאים
   * (eligibleProducts/eligibleCategories), שלא נטענים ברשימה למען קלילות. */
  async function handleEdit(promotion: PromotionRow) {
    const full = await getPromotion(promotion.id);
    if (!full) {
      toast.error("המבצע לא נמצא");
      return;
    }
    setEditingPromotion({
      ...toFormValues(promotion),
      eligibleProductIds: full.eligibleProducts.map((p) => p.productId),
      eligibleCategoryIds: full.eligibleCategories.map((c) => c.categoryId),
    });
    setSheetOpen(true);
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-neutral-400">{promotions.length} מבצעים</p>
        <button type="button" onClick={handleCreate} className={cn(buttonVariants({ size: "md" }))}>
          <Plus className="h-4 w-4" />
          מבצע חדש
        </button>
      </div>

      {promotions.length === 0 ? (
        <p className="mt-8 text-center text-neutral-400">אין מבצעים עדיין.</p>
      ) : (
        <div className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>שם</TableHead>
                <TableHead>סוג</TableHead>
                <TableHead>הטבה</TableHead>
                <TableHead>חל על</TableHead>
                <TableHead>הפעלה</TableHead>
                <TableHead>קופונים</TableHead>
                <TableHead>פעילה</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotions.map((promotion) => (
                <TableRow key={promotion.id}>
                  <TableCell>
                    <Link href={`/admin/promotions/${promotion.id}`} className="font-medium text-white hover:underline">
                      {promotion.name}
                    </Link>
                    {(promotion._count.eligibleProducts > 0 || promotion._count.eligibleCategories > 0) && (
                      <p className="text-xs text-neutral-500">
                        זכאות מוגבלת: {promotion._count.eligibleProducts} מוצרים, {promotion._count.eligibleCategories}{" "}
                        קטגוריות
                      </p>
                    )}
                  </TableCell>
                  <TableCell>{KIND_LABELS[promotion.kind] ?? promotion.kind}</TableCell>
                  <TableCell>{kindSummary(promotion, "he")}</TableCell>
                  <TableCell>{promotion.appliesTo === "SHOP" ? "חנות" : "קורסים"}</TableCell>
                  <TableCell>
                    <Badge tone={promotion.automatic ? "info" : "purple"}>
                      {promotion.automatic ? "אוטומטי" : "קופון"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/promotions/${promotion.id}`}
                      className="inline-flex items-center gap-1 text-neutral-300 hover:text-white hover:underline"
                    >
                      <Ticket className="h-3.5 w-3.5" />
                      {promotion._count.coupons}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <PromotionActiveToggle id={promotion.id} checked={promotion.active} name={promotion.name} />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
                          aria-label="פעולות נוספות"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => handleEdit(promotion)}>
                          <Pencil className="h-4 w-4" />
                          עריכה
                        </DropdownMenuItem>
                        <DropdownMenuItem destructive onSelect={() => setDeletingPromotion(promotion)}>
                          <Trash2 className="h-4 w-4" />
                          מחיקה
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <PromotionEditSheet open={sheetOpen} onOpenChange={setSheetOpen} promotion={editingPromotion} />

      <ConfirmDialog
        open={deletingPromotion !== null}
        onOpenChange={(open) => !open && setDeletingPromotion(null)}
        title="מחיקת מבצע"
        description={`למחוק את "${deletingPromotion?.name}"? כל הקופונים והמימושים המשויכים יימחקו גם הם.`}
        confirmLabel="מחיקה"
        onConfirm={handleDelete}
      />
    </div>
  );
}

function PromotionActiveToggle({ id, checked, name }: { id: string; checked: boolean; name: string }) {
  const router = useRouter();
  const [optimistic, setOptimistic] = useState(checked);
  const [isPending, startTransition] = useTransition();

  return (
    <Switch
      checked={optimistic}
      disabled={isPending}
      aria-label={`מבצע פעיל — ${name}`}
      onCheckedChange={(value) => {
        setOptimistic(value);
        startTransition(async () => {
          const result = await togglePromotionActive(id, value);
          if (result.ok) {
            router.refresh();
          } else {
            setOptimistic(!value);
            toast.error(result.error);
          }
        });
      }}
    />
  );
}

/** ממיר שורת DB לצורת קלט הטופס — לא מייבא ישירות כי DB נושא Date/Int, הטופס מחרוזות. */
function toFormValues(promotion: PromotionRow): EditingPromotion {
  return {
    id: promotion.id,
    name: promotion.name,
    description: promotion.description ?? "",
    kind: promotion.kind as PromotionDetailsInput["kind"],
    automatic: promotion.automatic,
    appliesTo: promotion.appliesTo as PromotionDetailsInput["appliesTo"],
    percentInput: bpToPercentInput(promotion.percentBp),
    amountShekels: agorotToShekelsInput(promotion.amountAgorot),
    freeShippingMinSubtotalShekels: agorotToShekelsInput(promotion.freeShippingMinSubtotalAgorot),
    minSubtotalShekels: agorotToShekelsInput(promotion.minSubtotalAgorot),
    appliesToSaleItems: promotion.appliesToSaleItems,
    startsAt: utcToJerusalemLocal(promotion.startsAt),
    endsAt: utcToJerusalemLocal(promotion.endsAt),
    active: promotion.active,
    priority: promotion.priority,
    stackable: promotion.stackable,
    // eligibleProductIds/eligibleCategoryIds נטענים בנפרד ב-Sheet (getPromotion) —
    // לרשימה אין אותם בזול; ברירת מחדל ריקה כאן מוחלפת בפועל בעת פתיחה לעריכה.
    eligibleProductIds: [],
    eligibleCategoryIds: [],
  };
}
