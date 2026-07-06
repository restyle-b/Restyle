"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Copy } from "lucide-react";
import { generateCouponsSchema, type GenerateCouponsInput } from "@/lib/admin/promotion-schema";
import { generateCoupons } from "@/server/actions/admin/coupons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { buttonVariants } from "@/components/ui/button";
import { adminInputClass as inputClass } from "@/lib/admin/form-styles";
import { cn } from "@/lib/utils";

function emptyValues(): GenerateCouponsInput {
  return {
    count: 10,
    prefix: "",
    codeLength: 8,
    usageLimitInput: "1",
    perCustomerLimitInput: "1",
    expiresAt: "",
  };
}

/** יצירת קודי קופון בכמות — אחרי הצלחה מציג את הרשימה שנוצרה עם כפתור העתקה. */
export function GenerateCouponsDialog({
  open,
  onOpenChange,
  promotionId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promotionId: string;
}) {
  const router = useRouter();
  const [generatedCodes, setGeneratedCodes] = useState<string[] | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GenerateCouponsInput>({
    resolver: zodResolver(generateCouponsSchema),
    defaultValues: emptyValues(),
  });

  function handleOpenChange(next: boolean) {
    if (next) {
      reset(emptyValues());
      setGeneratedCodes(null);
    }
    onOpenChange(next);
  }

  async function onSubmit(values: GenerateCouponsInput) {
    const result = await generateCoupons(promotionId, values);
    if (result.ok) {
      setGeneratedCodes(result.codes);
      toast.success(`${result.codes.length} קודי קופון נוצרו`);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleCopyAll() {
    if (!generatedCodes) return;
    try {
      await navigator.clipboard.writeText(generatedCodes.join("\n"));
      toast.success("הקודים הועתקו");
    } catch {
      toast.error("ההעתקה נכשלה");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>יצירת קודי קופון בכמות</DialogTitle>
          <DialogDescription>יוצר N קודים ייחודיים המצביעים על אותו מבצע.</DialogDescription>
        </DialogHeader>

        {generatedCodes ? (
          <div className="flex flex-col gap-3">
            <div className="max-h-64 overflow-y-auto rounded-md border border-line-dark p-3 font-mono text-sm text-neutral-200">
              {generatedCodes.map((code) => (
                <div key={code}>{code}</div>
              ))}
            </div>
            <DialogFooter>
              <button
                type="button"
                onClick={handleCopyAll}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                <Copy className="h-4 w-4" />
                העתקת כל הקודים
              </button>
              <button
                type="button"
                onClick={() => handleOpenChange(false)}
                className={cn(buttonVariants({ size: "sm" }))}
              >
                סגירה
              </button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="gen-count" className="mb-1.5 block text-sm font-medium text-neutral-300">
                  כמות קודים (עד 500)
                </label>
                <input
                  id="gen-count"
                  type="number"
                  className={inputClass}
                  {...register("count", { valueAsNumber: true })}
                />
                {errors.count && <p className="mt-1 text-sm text-red-400">{errors.count.message}</p>}
              </div>
              <div>
                <label htmlFor="gen-codeLength" className="mb-1.5 block text-sm font-medium text-neutral-300">
                  אורך קוד (לא כולל קידומת)
                </label>
                <input
                  id="gen-codeLength"
                  type="number"
                  className={inputClass}
                  {...register("codeLength", { valueAsNumber: true })}
                />
              </div>
            </div>

            <div>
              <label htmlFor="gen-prefix" className="mb-1.5 block text-sm font-medium text-neutral-300">
                קידומת (אופציונלי, למשל SUMMER)
              </label>
              <input id="gen-prefix" className={cn(inputClass, "uppercase")} {...register("prefix")} />
              {errors.prefix && <p className="mt-1 text-sm text-red-400">{errors.prefix.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="gen-usageLimitInput" className="mb-1.5 block text-sm font-medium text-neutral-300">
                  תקרת שימושים לכל קוד
                </label>
                <input id="gen-usageLimitInput" className={inputClass} {...register("usageLimitInput")} />
              </div>
              <div>
                <label
                  htmlFor="gen-perCustomerLimitInput"
                  className="mb-1.5 block text-sm font-medium text-neutral-300"
                >
                  תקרה ללקוח
                </label>
                <input id="gen-perCustomerLimitInput" className={inputClass} {...register("perCustomerLimitInput")} />
              </div>
            </div>

            <div>
              <label htmlFor="gen-expiresAt" className="mb-1.5 block text-sm font-medium text-neutral-300">
                תפוגה (ריק = ללא הגבלה)
              </label>
              <input id="gen-expiresAt" type="datetime-local" className={inputClass} {...register("expiresAt")} />
              {errors.expiresAt && <p className="mt-1 text-sm text-red-400">{errors.expiresAt.message}</p>}
            </div>

            <DialogFooter>
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(buttonVariants({ size: "sm" }))}
              >
                {isSubmitting ? "יוצר..." : "יצירה"}
              </button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
