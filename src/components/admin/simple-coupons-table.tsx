"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Coupon } from "@prisma/client";
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
import { SimpleCouponEditSheet } from "@/components/admin/simple-coupon-edit-sheet";
import { deleteSimpleCoupon, toggleSimpleCouponActive } from "@/server/actions/admin/coupons";
import { bpToPercentInput } from "@/lib/admin/promotion-schema";
import { utcToJerusalemLocal } from "@/lib/admin/product-schema";
import { formatAgorot } from "@/lib/format";
import { cn } from "@/lib/utils";

type SimpleCouponRow = Coupon & {
  promotion: {
    kind: string;
    percentBp: number | null;
    amountAgorot: number | null;
    active: boolean;
    _count: { excludedProducts: number };
  };
};

function discountSummary(coupon: SimpleCouponRow): string {
  if (coupon.promotion.kind === "PERCENT") {
    return coupon.promotion.percentBp ? `${bpToPercentInput(coupon.promotion.percentBp)}%` : "—";
  }
  return coupon.promotion.amountAgorot ? formatAgorot(coupon.promotion.amountAgorot, "he") : "—";
}

export function SimpleCouponsTable({ coupons }: { coupons: SimpleCouponRow[] }) {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const [deletingCoupon, setDeletingCoupon] = useState<SimpleCouponRow | null>(null);

  async function handleDelete() {
    if (!deletingCoupon) return;
    const result = await deleteSimpleCoupon(deletingCoupon.id);
    if (result.ok) {
      toast.success("הקופון נמחק");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  function handleCreate() {
    setEditingCouponId(null);
    setSheetOpen(true);
  }

  function handleEdit(coupon: SimpleCouponRow) {
    setEditingCouponId(coupon.id);
    setSheetOpen(true);
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-neutral-400">{coupons.length} קופונים</p>
        <button type="button" onClick={handleCreate} className={cn(buttonVariants({ size: "md", variant: "light" }))}>
          <Plus className="h-4 w-4" />
          קופון חדש
        </button>
      </div>

      {coupons.length === 0 ? (
        <p className="mt-8 text-center text-neutral-400">אין קופונים עדיין.</p>
      ) : (
        <div className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>קוד</TableHead>
                <TableHead>הנחה</TableHead>
                <TableHead>שימושים</TableHead>
                <TableHead>תוקף</TableHead>
                <TableHead>החרגות</TableHead>
                <TableHead>פעיל</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-mono font-medium text-white [direction:ltr] text-right">
                    {coupon.code}
                  </TableCell>
                  <TableCell>{discountSummary(coupon)}</TableCell>
                  <TableCell>
                    {coupon.usedCount}
                    {coupon.usageLimit !== null ? ` / ${coupon.usageLimit}` : " (ללא הגבלה)"}
                  </TableCell>
                  <TableCell>{coupon.expiresAt ? utcToJerusalemLocal(coupon.expiresAt) : "ללא הגבלה"}</TableCell>
                  <TableCell>
                    {coupon.promotion._count.excludedProducts > 0 ? (
                      <Badge tone="outline">{coupon.promotion._count.excludedProducts} מוצרים</Badge>
                    ) : (
                      <span className="text-neutral-500">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <SimpleCouponActiveToggle id={coupon.id} checked={coupon.active} code={coupon.code} />
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
                        <DropdownMenuItem onSelect={() => handleEdit(coupon)}>
                          <Pencil className="h-4 w-4" />
                          עריכה
                        </DropdownMenuItem>
                        <DropdownMenuItem destructive onSelect={() => setDeletingCoupon(coupon)}>
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

      <SimpleCouponEditSheet open={sheetOpen} onOpenChange={setSheetOpen} couponId={editingCouponId} />

      <ConfirmDialog
        open={deletingCoupon !== null}
        onOpenChange={(open) => !open && setDeletingCoupon(null)}
        title="מחיקת קופון"
        description={`למחוק את הקוד "${deletingCoupon?.code}"? מימושים היסטוריים יימחקו גם הם.`}
        confirmLabel="מחיקה"
        onConfirm={handleDelete}
      />
    </div>
  );
}

function SimpleCouponActiveToggle({ id, checked, code }: { id: string; checked: boolean; code: string }) {
  const router = useRouter();
  const [optimistic, setOptimistic] = useState(checked);
  const [isPending, startTransition] = useTransition();

  return (
    <Switch
      checked={optimistic}
      disabled={isPending}
      aria-label={`קופון פעיל — ${code}`}
      onCheckedChange={(value) => {
        setOptimistic(value);
        startTransition(async () => {
          const result = await toggleSimpleCouponActive(id, value);
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
