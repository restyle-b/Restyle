"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { couponDetailsSchema, type CouponDetailsInput } from "@/lib/admin/promotion-schema";
import { createCoupon, updateCoupon } from "@/server/actions/admin/coupons";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { buttonVariants } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { adminInputClass as inputClass } from "@/lib/admin/form-styles";
import { cn } from "@/lib/utils";

function emptyValues(): CouponDetailsInput {
  return {
    code: "",
    usageLimitInput: "",
    perCustomerLimitInput: "",
    minSubtotalShekels: "",
    startsAt: "",
    expiresAt: "",
    active: true,
  };
}

export function CouponEditSheet({
  open,
  onOpenChange,
  promotionId,
  coupon,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promotionId: string;
  /** null = יצירת קופון חדש; אחרת עריכה. */
  coupon: (CouponDetailsInput & { id: string }) | null;
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CouponDetailsInput>({
    resolver: zodResolver(couponDetailsSchema),
    defaultValues: coupon ?? emptyValues(),
  });

  const active = watch("active");

  function handleOpenChange(next: boolean) {
    if (next) reset(coupon ?? emptyValues());
    onOpenChange(next);
  }

  async function onSubmit(values: CouponDetailsInput) {
    const result = coupon
      ? await updateCoupon(coupon.id, values)
      : await createCoupon(promotionId, values);
    if (result.ok) {
      toast.success(coupon ? "הקופון עודכן" : "הקופון נוצר");
      onOpenChange(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{coupon ? "עריכת קופון" : "קופון חדש"}</SheetTitle>
          <SheetDescription>
            {coupon ? "עריכת פרטי הקופון." : "קוד ייחודי — אותיות/ספרות באנגלית בלבד, יישמר באותיות גדולות."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-4 overflow-y-auto" noValidate>
          <div>
            <label htmlFor="coupon-code" className="mb-1.5 block text-sm font-medium text-neutral-300">
              קוד קופון
            </label>
            <input
              id="coupon-code"
              className={cn(inputClass, "uppercase")}
              placeholder="SUMMER10"
              {...register("code")}
              autoFocus
            />
            {errors.code && <p className="mt-1 text-sm text-red-400">{errors.code.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="coupon-usageLimitInput" className="mb-1.5 block text-sm font-medium text-neutral-300">
                תקרת שימושים (ריק = ללא הגבלה)
              </label>
              <input id="coupon-usageLimitInput" className={inputClass} {...register("usageLimitInput")} />
              {errors.usageLimitInput && (
                <p className="mt-1 text-sm text-red-400">{errors.usageLimitInput.message}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="coupon-perCustomerLimitInput"
                className="mb-1.5 block text-sm font-medium text-neutral-300"
              >
                תקרה ללקוח (ריק = ללא הגבלה)
              </label>
              <input id="coupon-perCustomerLimitInput" className={inputClass} {...register("perCustomerLimitInput")} />
              {errors.perCustomerLimitInput && (
                <p className="mt-1 text-sm text-red-400">{errors.perCustomerLimitInput.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="coupon-minSubtotalShekels" className="mb-1.5 block text-sm font-medium text-neutral-300">
              סכום מינימום (₪, override על המבצע — ריק = לפי המבצע)
            </label>
            <input id="coupon-minSubtotalShekels" className={inputClass} {...register("minSubtotalShekels")} />
            {errors.minSubtotalShekels && (
              <p className="mt-1 text-sm text-red-400">{errors.minSubtotalShekels.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="coupon-startsAt" className="mb-1.5 block text-sm font-medium text-neutral-300">
                תחילת תוקף (ריק = מיידי)
              </label>
              <input id="coupon-startsAt" type="datetime-local" className={inputClass} {...register("startsAt")} />
              {errors.startsAt && <p className="mt-1 text-sm text-red-400">{errors.startsAt.message}</p>}
            </div>
            <div>
              <label htmlFor="coupon-expiresAt" className="mb-1.5 block text-sm font-medium text-neutral-300">
                תפוגה (ריק = ללא הגבלה)
              </label>
              <input id="coupon-expiresAt" type="datetime-local" className={inputClass} {...register("expiresAt")} />
              {errors.expiresAt && <p className="mt-1 text-sm text-red-400">{errors.expiresAt.message}</p>}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-neutral-300">
            <Switch checked={active} onCheckedChange={(value) => setValue("active", value, { shouldDirty: true })} />
            פעיל
          </label>

          <SheetFooter>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(buttonVariants({ size: "lg", variant: "light" }), "w-full justify-center")}
            >
              {isSubmitting ? "שומר..." : coupon ? "שמירת שינויים" : "יצירת קופון"}
            </button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
