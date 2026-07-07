"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { categoryDetailsSchema, type CategoryDetailsInput } from "@/lib/admin/category-schema";
import { createCategory, updateCategory } from "@/server/actions/admin/categories";
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

function emptyValues(): CategoryDetailsInput {
  return { nameHe: "", nameEn: "", nameAr: "", order: 0, active: true };
}

export function CategoryEditSheet({
  open,
  onOpenChange,
  category,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null = יצירת קטגוריה חדשה; אחרת עריכה. */
  category: (CategoryDetailsInput & { id: string }) | null;
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryDetailsInput>({
    resolver: zodResolver(categoryDetailsSchema),
    defaultValues: category ?? emptyValues(),
  });

  const active = watch("active");

  function handleOpenChange(next: boolean) {
    if (next) {
      reset(category ?? emptyValues());
    }
    onOpenChange(next);
  }

  async function onSubmit(values: CategoryDetailsInput) {
    const result = category
      ? await updateCategory(category.id, values)
      : await createCategory(values);
    if (result.ok) {
      toast.success(category ? "הקטגוריה עודכנה" : "הקטגוריה נוצרה");
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
          <SheetTitle>{category ? "עריכת קטגוריה" : "קטגוריה חדשה"}</SheetTitle>
          <SheetDescription>
            {category
              ? "עריכת פרטי הקטגוריה."
              : "שם בעברית מספיק כדי להתחיל — שאר השדות אופציונליים."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-4 overflow-y-auto" noValidate>
          <div>
            <label htmlFor="category-nameHe" className="mb-1.5 block text-sm font-medium text-neutral-300">
              שם (עברית)
            </label>
            <input id="category-nameHe" className={inputClass} {...register("nameHe")} autoFocus />
            {errors.nameHe && <p className="mt-1 text-sm text-red-400">{errors.nameHe.message}</p>}
          </div>

          <div>
            <label htmlFor="category-nameEn" className="mb-1.5 block text-sm font-medium text-neutral-300">
              שם (אנגלית)
            </label>
            <input id="category-nameEn" className={inputClass} {...register("nameEn")} />
          </div>

          <div>
            <label htmlFor="category-nameAr" className="mb-1.5 block text-sm font-medium text-neutral-300">
              שם (ערבית)
            </label>
            <input id="category-nameAr" className={inputClass} {...register("nameAr")} />
          </div>

          <div>
            <label htmlFor="category-order" className="mb-1.5 block text-sm font-medium text-neutral-300">
              סדר תצוגה
            </label>
            <input
              id="category-order"
              type="number"
              className={inputClass}
              {...register("order", { valueAsNumber: true })}
            />
            {errors.order && <p className="mt-1 text-sm text-red-400">{errors.order.message}</p>}
          </div>

          <label className="flex items-center gap-2 text-sm text-neutral-300">
            <Switch
              checked={active}
              onCheckedChange={(value) => setValue("active", value, { shouldDirty: true })}
            />
            פעילה (מוצגת בחנות)
          </label>

          <SheetFooter>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(buttonVariants({ size: "lg", variant: "light" }), "w-full justify-center")}
            >
              {isSubmitting ? "שומר..." : category ? "שמירת שינויים" : "יצירת קטגוריה"}
            </button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
