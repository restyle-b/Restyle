"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { productDetailsSchema, type ProductDetailsInput } from "@/lib/admin/product-schema";
import { createProduct, updateProductDetails } from "@/server/actions/admin/products";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { buttonVariants } from "@/components/ui/button";
import { ImageUploadButton } from "@/components/admin/image-upload-button";
import { adminInputClass as inputClass, adminTextareaClass as textareaClass } from "@/lib/admin/form-styles";
import { cn } from "@/lib/utils";

type Category = { id: string; nameHe: string };

function emptyValues(): ProductDetailsInput {
  return {
    order: 0,
    nameHe: "",
    nameEn: "",
    nameAr: "",
    descriptionHe: "",
    descriptionEn: "",
    descriptionAr: "",
    priceShekels: "",
    stock: 0,
    imageUrl: "",
    categoryId: "",
    active: true,
    publishAt: "",
    seoTitleHe: "",
    seoTitleEn: "",
    seoTitleAr: "",
    seoDescriptionHe: "",
    seoDescriptionEn: "",
    seoDescriptionAr: "",
  };
}

export function ProductEditSheet({
  open,
  onOpenChange,
  categories,
  product,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  /** null = יצירת מוצר חדש; אחרת עריכה. */
  product: (ProductDetailsInput & { id: string }) | null;
}) {
  const router = useRouter();
  const [showMore, setShowMore] = useState(false);
  const [showSeo, setShowSeo] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductDetailsInput>({
    resolver: zodResolver(productDetailsSchema),
    defaultValues: product ?? emptyValues(),
  });

  const imageUrl = watch("imageUrl");

  function handleOpenChange(next: boolean) {
    if (next) {
      reset(product ?? emptyValues());
      setShowMore(false);
      setShowSeo(false);
    }
    onOpenChange(next);
  }

  async function onSubmit(values: ProductDetailsInput) {
    const result = product ? await updateProductDetails(product.id, values) : await createProduct(values);
    if (result.ok) {
      toast.success(product ? "המוצר עודכן" : "המוצר נוצר");
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
          <SheetTitle>{product ? "עריכת מוצר" : "מוצר חדש"}</SheetTitle>
          <SheetDescription>
            {product ? "עריכת הפרטים המלאים של המוצר." : "שם, מחיר ומלאי מספיקים כדי להתחיל — שאר הפרטים אופציונליים."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-4 overflow-y-auto" noValidate>
          <div>
            <label htmlFor="product-nameHe" className="mb-1.5 block text-sm font-medium text-neutral-300">
              שם המוצר (עברית)
            </label>
            <input id="product-nameHe" className={inputClass} {...register("nameHe")} autoFocus />
            {errors.nameHe && <p className="mt-1 text-sm text-red-400">{errors.nameHe.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="product-priceShekels" className="mb-1.5 block text-sm font-medium text-neutral-300">
                מחיר (₪)
              </label>
              <input
                id="product-priceShekels"
                className={inputClass}
                placeholder="49.90"
                {...register("priceShekels")}
              />
              {errors.priceShekels && <p className="mt-1 text-sm text-red-400">{errors.priceShekels.message}</p>}
            </div>
            <div>
              <label htmlFor="product-stock" className="mb-1.5 block text-sm font-medium text-neutral-300">
                מלאי
              </label>
              <input
                id="product-stock"
                type="number"
                className={inputClass}
                {...register("stock", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div>
            <label htmlFor="product-categoryId" className="mb-1.5 block text-sm font-medium text-neutral-300">
              קטגוריה
            </label>
            <select id="product-categoryId" className={inputClass} {...register("categoryId")}>
              <option value="">ללא קטגוריה</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameHe}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="product-descriptionHe" className="mb-1.5 block text-sm font-medium text-neutral-300">
              תיאור (עברית)
            </label>
            <textarea id="product-descriptionHe" className={textareaClass} {...register("descriptionHe")} />
            {errors.descriptionHe && <p className="mt-1 text-sm text-red-400">{errors.descriptionHe.message}</p>}
          </div>

          <button
            type="button"
            onClick={() => setShowMore((v) => !v)}
            className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white"
          >
            <ChevronDown className={cn("h-4 w-4 transition-transform", showMore && "rotate-180")} />
            פרטים נוספים (אנגלית/ערבית, תמונה, סדר)
          </button>

          {showMore && (
            <div className="flex flex-col gap-4 border-t border-line-dark pt-4">
              <div>
                <label htmlFor="product-nameEn" className="mb-1.5 block text-sm font-medium text-neutral-300">
                  שם (אנגלית)
                </label>
                <input id="product-nameEn" className={inputClass} {...register("nameEn")} />
              </div>
              <div>
                <label htmlFor="product-nameAr" className="mb-1.5 block text-sm font-medium text-neutral-300">
                  שם (ערבית)
                </label>
                <input id="product-nameAr" className={inputClass} {...register("nameAr")} />
              </div>
              <div>
                <label htmlFor="product-descriptionEn" className="mb-1.5 block text-sm font-medium text-neutral-300">
                  תיאור (אנגלית)
                </label>
                <textarea id="product-descriptionEn" className={textareaClass} {...register("descriptionEn")} />
              </div>
              <div>
                <label htmlFor="product-descriptionAr" className="mb-1.5 block text-sm font-medium text-neutral-300">
                  תיאור (ערבית)
                </label>
                <textarea id="product-descriptionAr" className={textareaClass} {...register("descriptionAr")} />
              </div>
              <div>
                <label htmlFor="product-imageUrl" className="mb-1.5 block text-sm font-medium text-neutral-300">
                  תמונה
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <ImageUploadButton
                    onUploaded={(url) => setValue("imageUrl", url, { shouldDirty: true, shouldValidate: true })}
                  />
                  <input
                    id="product-imageUrl"
                    className={cn(inputClass, "flex-1 basis-48")}
                    placeholder="או קישור (URL)"
                    {...register("imageUrl")}
                  />
                </div>
                {errors.imageUrl && <p className="mt-1 text-sm text-red-400">{errors.imageUrl.message}</p>}
                {imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element -- תצוגה מקדימה באדמין בלבד
                  <img src={imageUrl} alt="" className="mt-2 h-20 w-20 rounded-md object-cover" />
                )}
              </div>
              <div>
                <label htmlFor="product-order" className="mb-1.5 block text-sm font-medium text-neutral-300">
                  סדר תצוגה
                </label>
                <input
                  id="product-order"
                  type="number"
                  className={inputClass}
                  {...register("order", { valueAsNumber: true })}
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-neutral-300">
                <input type="checkbox" {...register("active")} />
                נראה בחנות הציבורית
              </label>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowSeo((v) => !v)}
            className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white"
          >
            <ChevronDown className={cn("h-4 w-4 transition-transform", showSeo && "rotate-180")} />
            SEO ותזמון פרסום
          </button>

          {showSeo && (
            <div className="flex flex-col gap-4 border-t border-line-dark pt-4">
              <div>
                <label htmlFor="product-publishAt" className="mb-1.5 block text-sm font-medium text-neutral-300">
                  תזמון פרסום
                </label>
                <input
                  id="product-publishAt"
                  type="datetime-local"
                  className={inputClass}
                  {...register("publishAt")}
                />
                <p className="mt-1 text-xs text-neutral-500">מוצג בשעון ישראל; ריק = מתפרסם מיד עם ההפעלה</p>
                {errors.publishAt && <p className="mt-1 text-sm text-red-400">{errors.publishAt.message}</p>}
              </div>
              <div>
                <label htmlFor="product-seoTitleHe" className="mb-1.5 block text-sm font-medium text-neutral-300">
                  כותרת SEO (עברית)
                </label>
                <input id="product-seoTitleHe" className={inputClass} {...register("seoTitleHe")} />
              </div>
              <div>
                <label htmlFor="product-seoTitleEn" className="mb-1.5 block text-sm font-medium text-neutral-300">
                  כותרת SEO (אנגלית)
                </label>
                <input id="product-seoTitleEn" className={inputClass} {...register("seoTitleEn")} />
              </div>
              <div>
                <label htmlFor="product-seoTitleAr" className="mb-1.5 block text-sm font-medium text-neutral-300">
                  כותרת SEO (ערבית)
                </label>
                <input id="product-seoTitleAr" className={inputClass} {...register("seoTitleAr")} />
              </div>
              <div>
                <label
                  htmlFor="product-seoDescriptionHe"
                  className="mb-1.5 block text-sm font-medium text-neutral-300"
                >
                  תיאור SEO (עברית)
                </label>
                <textarea
                  id="product-seoDescriptionHe"
                  className={cn(textareaClass, "min-h-16")}
                  {...register("seoDescriptionHe")}
                />
              </div>
              <div>
                <label
                  htmlFor="product-seoDescriptionEn"
                  className="mb-1.5 block text-sm font-medium text-neutral-300"
                >
                  תיאור SEO (אנגלית)
                </label>
                <textarea
                  id="product-seoDescriptionEn"
                  className={cn(textareaClass, "min-h-16")}
                  {...register("seoDescriptionEn")}
                />
              </div>
              <div>
                <label
                  htmlFor="product-seoDescriptionAr"
                  className="mb-1.5 block text-sm font-medium text-neutral-300"
                >
                  תיאור SEO (ערבית)
                </label>
                <textarea
                  id="product-seoDescriptionAr"
                  className={cn(textareaClass, "min-h-16")}
                  {...register("seoDescriptionAr")}
                />
              </div>
            </div>
          )}

          <SheetFooter>
            <button type="submit" disabled={isSubmitting} className={cn(buttonVariants({ size: "lg", variant: "light" }), "w-full justify-center")}>
              {isSubmitting ? "שומר..." : product ? "שמירת שינויים" : "יצירת מוצר"}
            </button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
