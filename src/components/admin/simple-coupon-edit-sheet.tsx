"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { simpleCouponSchema, type SimpleCouponInput } from "@/lib/admin/promotion-schema";
import { createSimpleCoupon, updateSimpleCoupon, getSimpleCoupon } from "@/server/actions/admin/coupons";
import { getEligibilityOptions } from "@/server/actions/admin/promotions";
import { utcToJerusalemLocal } from "@/lib/admin/product-schema";
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

function emptyValues(): SimpleCouponInput {
  return {
    code: "",
    discountType: "PERCENT",
    percentInput: "",
    amountShekels: "",
    active: true,
    expiresAt: "",
    minSubtotalShekels: "",
    usageLimitInput: "",
    excludedProductIds: [],
  };
}

/** כותרת-מקטע מתקפלת — אותו רעיון כמו promotion-edit-sheet.tsx/course-edit-sheet.tsx. */
function CollapsibleSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-line-dark pt-4">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-2 text-sm font-medium text-neutral-300 hover:text-white"
      >
        {title}
        <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="mt-4 flex flex-col gap-4">{children}</div>}
    </div>
  );
}

function ProductCheckboxList({
  options,
  selected,
  onChange,
}: {
  options: { id: string; nameHe: string }[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  if (options.length === 0) {
    return <p className="text-xs text-neutral-500">אין מוצרים במערכת</p>;
  }
  return (
    <div className="max-h-40 overflow-y-auto rounded-md border border-line-dark p-2">
      {options.map((option) => {
        const checked = selected.includes(option.id);
        return (
          <label
            key={option.id}
            className="flex items-center gap-2 rounded px-1.5 py-1 text-sm text-neutral-300 hover:bg-white/5"
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => {
                if (e.target.checked) onChange([...selected, option.id]);
                else onChange(selected.filter((id) => id !== option.id));
              }}
            />
            {option.nameHe}
          </label>
        );
      })}
    </div>
  );
}

export function SimpleCouponEditSheet({
  open,
  onOpenChange,
  couponId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null = יצירת קופון חדש; אחרת עריכה (מזהה ה-Coupon, לא ה-Promotion). */
  couponId: string | null;
}) {
  const router = useRouter();
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [productOptions, setProductOptions] = useState<{ id: string; nameHe: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SimpleCouponInput>({
    resolver: zodResolver(simpleCouponSchema),
    defaultValues: emptyValues(),
  });

  const discountType = watch("discountType");
  const active = watch("active");
  const excludedProductIds = watch("excludedProductIds") ?? [];

  useEffect(() => {
    if (!open) return;
    setAdvancedOpen(false);
    getEligibilityOptions()
      .then((options) => setProductOptions(options.products))
      .catch(() => toast.error("טעינת רשימת מוצרים נכשלה"));

    if (!couponId) {
      reset(emptyValues());
      return;
    }
    setLoading(true);
    getSimpleCoupon(couponId)
      .then((coupon) => {
        if (!coupon) {
          toast.error("קופון לא נמצא");
          return;
        }
        reset({
          code: coupon.code,
          discountType: coupon.discountType,
          percentInput: coupon.percentInput,
          amountShekels: coupon.amountShekels,
          active: coupon.active,
          expiresAt: utcToJerusalemLocal(coupon.expiresAt),
          minSubtotalShekels:
            coupon.minSubtotalAgorot != null && coupon.minSubtotalAgorot > 0
              ? String(coupon.minSubtotalAgorot / 100)
              : "",
          usageLimitInput: coupon.usageLimit != null ? String(coupon.usageLimit) : "",
          excludedProductIds: coupon.excludedProductIds,
        });
      })
      .catch(() => toast.error("טעינת הקופון נכשלה"))
      .finally(() => setLoading(false));
  }, [open, couponId, reset]);

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
  }

  async function onSubmit(values: SimpleCouponInput) {
    const result = couponId ? await updateSimpleCoupon(couponId, values) : await createSimpleCoupon(values);
    if (result.ok) {
      toast.success(couponId ? "הקופון עודכן" : "הקופון נוצר");
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
          <SheetTitle>{couponId ? "עריכת קופון" : "קופון חדש"}</SheetTitle>
          <SheetDescription>
            {couponId
              ? "עריכת פרטי הקופון."
              : "קוד ייחודי — אותיות/ספרות באנגלית בלבד, יישמר באותיות גדולות. זה בדיוק הקוד שהלקוח יזין בקופה."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-4 overflow-y-auto" noValidate>
          <div>
            <label htmlFor="simple-coupon-code" className="mb-1.5 block text-sm font-medium text-neutral-300">
              קוד קופון
            </label>
            <input
              id="simple-coupon-code"
              className={cn(inputClass, "uppercase")}
              placeholder="friends10"
              disabled={loading}
              {...register("code")}
              autoFocus
            />
            {errors.code && <p className="mt-1 text-sm text-red-400">{errors.code.message}</p>}
          </div>

          <div>
            <label htmlFor="simple-coupon-discountType" className="mb-1.5 block text-sm font-medium text-neutral-300">
              סוג הנחה
            </label>
            <select
              id="simple-coupon-discountType"
              className={inputClass}
              disabled={loading}
              {...register("discountType")}
            >
              <option value="PERCENT">אחוז הנחה</option>
              <option value="FIXED_AMOUNT">סכום קבוע</option>
            </select>
          </div>

          {discountType === "PERCENT" ? (
            <div>
              <label
                htmlFor="simple-coupon-percentInput"
                className="mb-1.5 block text-sm font-medium text-neutral-300"
              >
                אחוז הנחה (%)
              </label>
              <input
                id="simple-coupon-percentInput"
                className={inputClass}
                placeholder="10"
                disabled={loading}
                {...register("percentInput")}
              />
              {errors.percentInput && <p className="mt-1 text-sm text-red-400">{errors.percentInput.message}</p>}
            </div>
          ) : (
            <div>
              <label
                htmlFor="simple-coupon-amountShekels"
                className="mb-1.5 block text-sm font-medium text-neutral-300"
              >
                סכום הנחה (₪)
              </label>
              <input
                id="simple-coupon-amountShekels"
                className={inputClass}
                placeholder="50"
                disabled={loading}
                {...register("amountShekels")}
              />
              {errors.amountShekels && <p className="mt-1 text-sm text-red-400">{errors.amountShekels.message}</p>}
            </div>
          )}

          <label className="flex items-center gap-2 text-sm text-neutral-300">
            <Switch checked={active} onCheckedChange={(value) => setValue("active", value, { shouldDirty: true })} />
            פעיל
          </label>

          <CollapsibleSection title="הגדרות מתקדמות" open={advancedOpen} onToggle={() => setAdvancedOpen((v) => !v)}>
            <div>
              <label htmlFor="simple-coupon-expiresAt" className="mb-1.5 block text-sm font-medium text-neutral-300">
                תפוגה (ריק = ללא הגבלה)
              </label>
              <input
                id="simple-coupon-expiresAt"
                type="datetime-local"
                className={inputClass}
                {...register("expiresAt")}
              />
              {errors.expiresAt && <p className="mt-1 text-sm text-red-400">{errors.expiresAt.message}</p>}
            </div>

            <div>
              <label
                htmlFor="simple-coupon-minSubtotalShekels"
                className="mb-1.5 block text-sm font-medium text-neutral-300"
              >
                סכום מינימום להזמנה (₪, ריק = ללא סף)
              </label>
              <input
                id="simple-coupon-minSubtotalShekels"
                className={inputClass}
                placeholder="0"
                {...register("minSubtotalShekels")}
              />
              {errors.minSubtotalShekels && (
                <p className="mt-1 text-sm text-red-400">{errors.minSubtotalShekels.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="simple-coupon-usageLimitInput"
                className="mb-1.5 block text-sm font-medium text-neutral-300"
              >
                תקרת שימושים (ריק = ללא הגבלה)
              </label>
              <input id="simple-coupon-usageLimitInput" className={inputClass} {...register("usageLimitInput")} />
              {errors.usageLimitInput && (
                <p className="mt-1 text-sm text-red-400">{errors.usageLimitInput.message}</p>
              )}
            </div>

            <div>
              <p className="mb-1.5 text-sm font-medium text-neutral-300">
                מוצרים מוחרגים (ריק = חל על כל החנות)
              </p>
              <ProductCheckboxList
                options={productOptions}
                selected={excludedProductIds}
                onChange={(ids) => setValue("excludedProductIds", ids, { shouldDirty: true })}
              />
            </div>
          </CollapsibleSection>

          <SheetFooter>
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className={cn(buttonVariants({ size: "lg", variant: "light" }), "w-full justify-center")}
            >
              {isSubmitting ? "שומר..." : couponId ? "שמירת שינויים" : "יצירת קופון"}
            </button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
