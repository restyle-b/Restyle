"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import {
  promotionDetailsSchema,
  type PromotionDetailsInput,
} from "@/lib/admin/promotion-schema";
import { createPromotion, updatePromotion, getEligibilityOptions } from "@/server/actions/admin/promotions";
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
import { adminInputClass as inputClass, adminTextareaClass as textareaClass } from "@/lib/admin/form-styles";
import { cn } from "@/lib/utils";

function emptyValues(): PromotionDetailsInput {
  return {
    name: "",
    description: "",
    kind: "PERCENT",
    automatic: false,
    appliesTo: "SHOP",
    percentInput: "",
    amountShekels: "",
    freeShippingMinSubtotalShekels: "",
    minSubtotalShekels: "",
    appliesToSaleItems: true,
    startsAt: "",
    endsAt: "",
    active: true,
    priority: 0,
    stackable: false,
    eligibleProductIds: [],
    eligibleCategoryIds: [],
  };
}

/** כותרת-מקטע מתקפלת — אותו רעיון כמו course-edit-sheet.tsx. */
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

type EligibilityOptions = { products: { id: string; nameHe: string }[]; categories: { id: string; nameHe: string }[] };

function CheckboxList({
  options,
  selected,
  onChange,
  emptyLabel,
}: {
  options: { id: string; nameHe: string }[];
  selected: string[];
  onChange: (ids: string[]) => void;
  emptyLabel: string;
}) {
  if (options.length === 0) {
    return <p className="text-xs text-neutral-500">{emptyLabel}</p>;
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

export function PromotionEditSheet({
  open,
  onOpenChange,
  promotion,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null = יצירת מבצע חדש; אחרת עריכה. */
  promotion: (PromotionDetailsInput & { id: string }) | null;
}) {
  const router = useRouter();
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [options, setOptions] = useState<EligibilityOptions>({ products: [], categories: [] });
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PromotionDetailsInput>({
    resolver: zodResolver(promotionDetailsSchema),
    defaultValues: promotion ?? emptyValues(),
  });

  const kind = watch("kind");
  const automatic = watch("automatic");
  const appliesToSaleItems = watch("appliesToSaleItems");
  const active = watch("active");
  const stackable = watch("stackable");
  const eligibleProductIds = watch("eligibleProductIds") ?? [];
  const eligibleCategoryIds = watch("eligibleCategoryIds") ?? [];

  useEffect(() => {
    if (!open) return;
    getEligibilityOptions()
      .then(setOptions)
      .catch(() => toast.error("טעינת רשימת מוצרים/קטגוריות נכשלה"));
  }, [open]);

  function handleOpenChange(next: boolean) {
    if (next) {
      reset(promotion ?? emptyValues());
      setAdvancedOpen(false);
    }
    onOpenChange(next);
  }

  async function onSubmit(values: PromotionDetailsInput) {
    const result = promotion
      ? await updatePromotion(promotion.id, values)
      : await createPromotion(values);
    if (result.ok) {
      toast.success(promotion ? "המבצע עודכן" : "המבצע נוצר");
      onOpenChange(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{promotion ? "עריכת מבצע" : "מבצע חדש"}</SheetTitle>
          <SheetDescription>
            {promotion
              ? "עריכת פרטי המבצע."
              : "מבצע אוטומטי חל בלי קופון; אחרת יש לצרף קודי קופון אחרי היצירה."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-4 overflow-y-auto" noValidate>
          <div>
            <label htmlFor="promo-name" className="mb-1.5 block text-sm font-medium text-neutral-300">
              שם המבצע
            </label>
            <input id="promo-name" className={inputClass} {...register("name")} autoFocus />
            {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="promo-description" className="mb-1.5 block text-sm font-medium text-neutral-300">
              תיאור (פנימי, לא מוצג ללקוח)
            </label>
            <textarea id="promo-description" className={textareaClass} {...register("description")} />
          </div>

          <div>
            <label htmlFor="promo-kind" className="mb-1.5 block text-sm font-medium text-neutral-300">
              סוג ההטבה
            </label>
            <select id="promo-kind" className={inputClass} {...register("kind")}>
              <option value="PERCENT">אחוז הנחה</option>
              <option value="FIXED_AMOUNT">סכום קבוע</option>
              <option value="FREE_SHIPPING">משלוח חינם</option>
            </select>
          </div>

          {kind === "PERCENT" && (
            <div>
              <label htmlFor="promo-percentInput" className="mb-1.5 block text-sm font-medium text-neutral-300">
                אחוז הנחה (%)
              </label>
              <input
                id="promo-percentInput"
                className={inputClass}
                placeholder="10"
                {...register("percentInput")}
              />
              {errors.percentInput && <p className="mt-1 text-sm text-red-400">{errors.percentInput.message}</p>}
            </div>
          )}

          {kind === "FIXED_AMOUNT" && (
            <div>
              <label htmlFor="promo-amountShekels" className="mb-1.5 block text-sm font-medium text-neutral-300">
                סכום הנחה (₪)
              </label>
              <input
                id="promo-amountShekels"
                className={inputClass}
                placeholder="50"
                {...register("amountShekels")}
              />
              {errors.amountShekels && <p className="mt-1 text-sm text-red-400">{errors.amountShekels.message}</p>}
            </div>
          )}

          {kind === "FREE_SHIPPING" && (
            <div>
              <label
                htmlFor="promo-freeShippingMinSubtotalShekels"
                className="mb-1.5 block text-sm font-medium text-neutral-300"
              >
                סכום מינימום למשלוח חינם (₪, ריק = ללא סף)
              </label>
              <input
                id="promo-freeShippingMinSubtotalShekels"
                className={inputClass}
                placeholder="200"
                {...register("freeShippingMinSubtotalShekels")}
              />
              {errors.freeShippingMinSubtotalShekels && (
                <p className="mt-1 text-sm text-red-400">{errors.freeShippingMinSubtotalShekels.message}</p>
              )}
            </div>
          )}

          <label className="flex items-center gap-2 text-sm text-neutral-300">
            <Switch
              checked={automatic}
              onCheckedChange={(value) => setValue("automatic", value, { shouldDirty: true })}
            />
            מבצע אוטומטי (חל על כל עגלה זכאית, בלי קופון)
          </label>

          <label className="flex items-center gap-2 text-sm text-neutral-300">
            <Switch checked={active} onCheckedChange={(value) => setValue("active", value, { shouldDirty: true })} />
            פעיל
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="promo-startsAt" className="mb-1.5 block text-sm font-medium text-neutral-300">
                תחילת תוקף (ריק = מיידי)
              </label>
              <input id="promo-startsAt" type="datetime-local" className={inputClass} {...register("startsAt")} />
              {errors.startsAt && <p className="mt-1 text-sm text-red-400">{errors.startsAt.message}</p>}
            </div>
            <div>
              <label htmlFor="promo-endsAt" className="mb-1.5 block text-sm font-medium text-neutral-300">
                סוף תוקף (ריק = ללא הגבלה)
              </label>
              <input id="promo-endsAt" type="datetime-local" className={inputClass} {...register("endsAt")} />
              {errors.endsAt && <p className="mt-1 text-sm text-red-400">{errors.endsAt.message}</p>}
            </div>
          </div>

          <CollapsibleSection title="הגדרות מתקדמות" open={advancedOpen} onToggle={() => setAdvancedOpen((v) => !v)}>
            <div>
              <label htmlFor="promo-appliesTo" className="mb-1.5 block text-sm font-medium text-neutral-300">
                חל על
              </label>
              <select id="promo-appliesTo" className={inputClass} {...register("appliesTo")}>
                <option value="SHOP">חנות</option>
                <option value="COURSES">קורסים (בקרוב — עדיין לא נאכף בקופה)</option>
              </select>
            </div>

            <div>
              <label htmlFor="promo-minSubtotalShekels" className="mb-1.5 block text-sm font-medium text-neutral-300">
                סכום מינימום להפעלה (₪, ריק = ללא סף)
              </label>
              <input
                id="promo-minSubtotalShekels"
                className={inputClass}
                placeholder="0"
                {...register("minSubtotalShekels")}
              />
              {errors.minSubtotalShekels && (
                <p className="mt-1 text-sm text-red-400">{errors.minSubtotalShekels.message}</p>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm text-neutral-300">
              <Switch
                checked={appliesToSaleItems}
                onCheckedChange={(value) => setValue("appliesToSaleItems", value, { shouldDirty: true })}
              />
              חל גם על פריטים שכבר במבצע
            </label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="promo-priority" className="mb-1.5 block text-sm font-medium text-neutral-300">
                  עדיפות
                </label>
                <input
                  id="promo-priority"
                  type="number"
                  className={inputClass}
                  {...register("priority", { valueAsNumber: true })}
                />
                <p className="mt-1 text-xs text-neutral-500">שמור לעתיד — לא משפיע על החישוב כרגע</p>
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-sm text-neutral-300">
                  <Switch
                    checked={stackable ?? false}
                    onCheckedChange={(value) => setValue("stackable", value, { shouldDirty: true })}
                  />
                  ניתן לצירוף (שמור לעתיד)
                </label>
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-sm font-medium text-neutral-300">מוצרים זכאים (ריק = כל העגלה)</p>
              <CheckboxList
                options={options.products}
                selected={eligibleProductIds}
                onChange={(ids) => setValue("eligibleProductIds", ids, { shouldDirty: true })}
                emptyLabel="אין מוצרים במערכת"
              />
            </div>

            <div>
              <p className="mb-1.5 text-sm font-medium text-neutral-300">קטגוריות זכאיות (ריק = כל העגלה)</p>
              <CheckboxList
                options={options.categories}
                selected={eligibleCategoryIds}
                onChange={(ids) => setValue("eligibleCategoryIds", ids, { shouldDirty: true })}
                emptyLabel="אין קטגוריות במערכת"
              />
            </div>
          </CollapsibleSection>

          <SheetFooter>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(buttonVariants({ size: "lg", variant: "light" }), "w-full justify-center")}
            >
              {isSubmitting ? "שומר..." : promotion ? "שמירת שינויים" : "יצירת מבצע"}
            </button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
