"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Coupon } from "@prisma/client";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CouponEditSheet } from "@/components/admin/coupon-edit-sheet";
import { GenerateCouponsDialog } from "@/components/admin/generate-coupons-dialog";
import { deleteCoupon, toggleCouponActive } from "@/server/actions/admin/coupons";
import { agorotToShekelsInput, type CouponDetailsInput } from "@/lib/admin/promotion-schema";
import { utcToJerusalemLocal } from "@/lib/admin/product-schema";
import { cn } from "@/lib/utils";

export function CouponsTable({ promotionId, coupons }: { promotionId: string; coupons: Coupon[] }) {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<(CouponDetailsInput & { id: string }) | null>(null);
  const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null);

  async function handleDelete() {
    if (!deletingCoupon) return;
    const result = await deleteCoupon(deletingCoupon.id);
    if (result.ok) {
      toast.success("הקופון נמחק");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  function handleEdit(coupon: Coupon) {
    setEditingCoupon({
      id: coupon.id,
      code: coupon.code,
      usageLimitInput: coupon.usageLimit === null ? "" : String(coupon.usageLimit),
      perCustomerLimitInput: coupon.perCustomerLimit === null ? "" : String(coupon.perCustomerLimit),
      minSubtotalShekels: agorotToShekelsInput(coupon.minSubtotalAgorot),
      startsAt: utcToJerusalemLocal(coupon.startsAt),
      expiresAt: utcToJerusalemLocal(coupon.expiresAt),
      active: coupon.active,
    });
    setSheetOpen(true);
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-neutral-400">{coupons.length} קודי קופון</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setGenerateOpen(true)}
            className={cn(buttonVariants({ size: "md", variant: "outline" }))}
          >
            <Ticket className="h-4 w-4" />
            יצירת קודים בכמות
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingCoupon(null);
              setSheetOpen(true);
            }}
            className={cn(buttonVariants({ size: "md" }))}
          >
            <Plus className="h-4 w-4" />
            קופון בודד
          </button>
        </div>
      </div>

      {coupons.length === 0 ? (
        <p className="mt-8 text-center text-neutral-400">אין קופונים עדיין למבצע זה.</p>
      ) : (
        <div className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>קוד</TableHead>
                <TableHead>שימושים</TableHead>
                <TableHead>תקרה ללקוח</TableHead>
                <TableHead>תוקף</TableHead>
                <TableHead>פעיל</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-mono font-medium text-white">{coupon.code}</TableCell>
                  <TableCell>
                    {coupon.usedCount}
                    {coupon.usageLimit !== null ? ` / ${coupon.usageLimit}` : " (ללא הגבלה)"}
                  </TableCell>
                  <TableCell>{coupon.perCustomerLimit ?? "ללא הגבלה"}</TableCell>
                  <TableCell>{coupon.expiresAt ? utcToJerusalemLocal(coupon.expiresAt) : "ללא הגבלה"}</TableCell>
                  <TableCell>
                    <CouponActiveToggle id={coupon.id} checked={coupon.active} code={coupon.code} />
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

      <CouponEditSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        promotionId={promotionId}
        coupon={editingCoupon}
      />

      <GenerateCouponsDialog open={generateOpen} onOpenChange={setGenerateOpen} promotionId={promotionId} />

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

function CouponActiveToggle({ id, checked, code }: { id: string; checked: boolean; code: string }) {
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
          const result = await toggleCouponActive(id, value);
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
