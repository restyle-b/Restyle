"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import type { UserAddress } from "@prisma/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { buttonVariants } from "@/components/ui/button";
import { createAddressSchema, type AddressInput } from "@/lib/account/address-schema";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-md border border-line-dark bg-ink-soft px-4 py-2.5 text-white placeholder:text-neutral-500 focus:border-accent focus:outline-none";

/**
 * Sheet יצירה/עריכה — פורם אחד לשני המצבים (editingAddress null = יצירה).
 * ה-checkbox "הגדרה כברירת מחדל" הוא one-way: לא ניתן לבטל ברירת-מחדל
 * דרך הטופס בלי לבחור כתובת אחרת (נאכף גם בשרת ב-updateAddress).
 */
export function AddressFormSheet({
  open,
  onOpenChange,
  editingAddress,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingAddress: UserAddress | null;
  onSubmit: (values: AddressInput) => Promise<void>;
}) {
  const t = useTranslations("account.addresses.form");
  const tErrors = useTranslations("account.addresses.errors");

  const schema = useMemo(
    () =>
      createAddressSchema({
        labelRequired: tErrors("labelRequired"),
        lineRequired: tErrors("lineRequired"),
        cityRequired: tErrors("cityRequired"),
      }),
    [tErrors],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressInput>({
    resolver: zodResolver(schema),
    defaultValues: { label: "", line: "", city: "", notes: "", isDefault: false },
  });

  useEffect(() => {
    if (open) {
      reset({
        label: editingAddress?.label ?? "",
        line: editingAddress?.line ?? "",
        city: editingAddress?.city ?? "",
        notes: editingAddress?.notes ?? "",
        isDefault: editingAddress?.isDefault ?? false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset רק כשהגיליון נפתח/עורך אחר
  }, [open, editingAddress?.id]);

  async function handleFormSubmit(values: AddressInput) {
    await onSubmit(values);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="end">
        <SheetHeader>
          <SheetTitle>{editingAddress ? t("editTitle") : t("createTitle")}</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-1 flex-col gap-5 overflow-y-auto" noValidate>
          <div>
            <label htmlFor="addressLabel" className="mb-1.5 block text-sm font-medium text-neutral-300">
              {t("labelLabel")}
            </label>
            <input id="addressLabel" className={inputClass} {...register("label")} />
            {errors.label && <p className="mt-1.5 text-sm text-red-400">{errors.label.message}</p>}
          </div>

          <div>
            <label htmlFor="addressLine" className="mb-1.5 block text-sm font-medium text-neutral-300">
              {t("lineLabel")}
            </label>
            <input id="addressLine" className={inputClass} {...register("line")} />
            {errors.line && <p className="mt-1.5 text-sm text-red-400">{errors.line.message}</p>}
          </div>

          <div>
            <label htmlFor="addressCity" className="mb-1.5 block text-sm font-medium text-neutral-300">
              {t("cityLabel")}
            </label>
            <input id="addressCity" className={inputClass} {...register("city")} />
            {errors.city && <p className="mt-1.5 text-sm text-red-400">{errors.city.message}</p>}
          </div>

          <div>
            <label htmlFor="addressNotes" className="mb-1.5 block text-sm font-medium text-neutral-300">
              {t("notesLabel")}
            </label>
            <textarea id="addressNotes" rows={3} className={inputClass} {...register("notes")} />
          </div>

          <label className="flex items-center gap-2 text-sm text-neutral-300">
            <input type="checkbox" className="h-4 w-4 rounded border-line-dark" {...register("isDefault")} />
            {t("isDefaultLabel")}
          </label>

          <SheetFooter>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(buttonVariants({ variant: "light", size: "sm" }))}
            >
              {isSubmitting ? t("saving") : t("saveCta")}
            </button>
            <SheetClose className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              {t("cancelCta")}
            </SheetClose>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
