"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateProductStock } from "@/server/actions/admin/products";
import { stockAdjustNoteSchema } from "@/lib/admin/product-schema";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { buttonVariants } from "@/components/ui/button";
import { adminInputClass as inputClass, adminTextareaClass as textareaClass } from "@/lib/admin/form-styles";
import { cn } from "@/lib/utils";

type Mode = "set" | "delta";
type Product = { id: string; nameHe: string; stock: number };

/**
 * דיאלוג "התאמת מלאי" — נפתח מתפריט הפעולות בטבלת המוצרים (לא מחליף את
 * העריכה המהירה inline ב-ProductStockCell, שנשארת כפי שהיא). שני מצבים:
 * "קביעת כמות" (ערך מוחלט, כמו העריכה inline) ו-"הוספה/הפחתה" (delta, ל-UX
 * טבעי יותר כש"הגיעו עוד 20 יחידות"). שני המצבים מחשבים ערך stock מוחלט
 * וקוראים ל-updateProductStock — אין server action מקבילה חדשה, כנדרש.
 */
export function ProductStockAdjustSheet({
  open,
  onOpenChange,
  product,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("set");
  const [setStockValue, setSetStockValue] = useState("");
  const [deltaValue, setDeltaValue] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleOpenChange(next: boolean) {
    if (next && product) {
      setMode("set");
      setSetStockValue(product.stock.toString());
      setDeltaValue("");
      setNote("");
    }
    onOpenChange(next);
  }

  if (!product) {
    return <Sheet open={open} onOpenChange={handleOpenChange} />;
  }
  // עותק מקומי non-null — סגירות (parseResultingStock/handleSubmit) לא
  // מצמצמות אוטומטית משתנה חיצוני, גם אחרי ה-early-return למעלה.
  const activeProduct = product;

  // "" → Number("") === 0, לא NaN — לכן בודקים trim() !== "" מפורשות בשני
  // המצבים, אחרת ניקוי השדה היה "מצליח בשקט" עם מלאי 0.
  function parseResultingStock(): number | null {
    if (mode === "set") {
      if (setStockValue.trim() === "") return null;
      const num = Number(setStockValue);
      return Number.isFinite(num) ? num : null;
    }
    if (deltaValue.trim() === "") return null;
    const delta = Number(deltaValue);
    return Number.isFinite(delta) ? activeProduct.stock + delta : null;
  }

  const resultingStock = parseResultingStock();

  const isValid =
    resultingStock !== null && Number.isInteger(resultingStock) && resultingStock >= 0 && resultingStock <= 1_000_000;

  async function handleSubmit() {
    if (!isValid || resultingStock === null) return;

    const parsedNote = stockAdjustNoteSchema.safeParse(note);
    if (!parsedNote.success) {
      toast.error(parsedNote.error.issues[0]?.message ?? "הערה לא תקינה");
      return;
    }

    setSubmitting(true);
    const trimmedNote = parsedNote.data;
    const result = await updateProductStock(activeProduct.id, resultingStock, trimmedNote || undefined);
    setSubmitting(false);

    if (result.ok) {
      toast.success("המלאי עודכן");
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
          <SheetTitle>התאמת מלאי — {product.nameHe}</SheetTitle>
          <SheetDescription>מלאי נוכחי: {product.stock} יחידות.</SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4">
          <div className="flex gap-2 rounded-md border border-line-dark p-1">
            <button
              type="button"
              onClick={() => setMode("set")}
              className={cn(
                "flex-1 rounded-sm px-3 py-1.5 text-sm transition-colors",
                mode === "set" ? "bg-accent text-ink" : "text-neutral-300 hover:bg-white/5",
              )}
            >
              קביעת כמות
            </button>
            <button
              type="button"
              onClick={() => setMode("delta")}
              className={cn(
                "flex-1 rounded-sm px-3 py-1.5 text-sm transition-colors",
                mode === "delta" ? "bg-accent text-ink" : "text-neutral-300 hover:bg-white/5",
              )}
            >
              הוספה / הפחתה
            </button>
          </div>

          {mode === "set" ? (
            <div>
              <label htmlFor="stock-adjust-set" className="mb-1.5 block text-sm font-medium text-neutral-300">
                כמות חדשה במלאי
              </label>
              <input
                id="stock-adjust-set"
                type="number"
                inputMode="numeric"
                min={0}
                className={inputClass}
                value={setStockValue}
                onChange={(e) => setSetStockValue(e.target.value)}
                autoFocus
              />
            </div>
          ) : (
            <div>
              <label htmlFor="stock-adjust-delta" className="mb-1.5 block text-sm font-medium text-neutral-300">
                שינוי (חיובי להוספה, שלילי להפחתה)
              </label>
              <input
                id="stock-adjust-delta"
                type="number"
                inputMode="numeric"
                className={inputClass}
                placeholder="לדוגמה: 20 או ‎-5"
                value={deltaValue}
                onChange={(e) => setDeltaValue(e.target.value)}
                autoFocus
              />
              <p className="mt-1.5 text-xs text-neutral-500">
                מלאי לאחר השינוי:{" "}
                <span className={cn("font-medium", resultingStock !== null && !isValid && "text-red-400")}>
                  {resultingStock === null ? "—" : resultingStock}
                </span>
              </p>
            </div>
          )}

          {resultingStock !== null && !isValid && (
            <p className="text-sm text-red-400">הערך שהוזן אינו תקין (המלאי לא יכול להיות שלילי).</p>
          )}

          <div>
            <label htmlFor="stock-adjust-note" className="mb-1.5 block text-sm font-medium text-neutral-300">
              הערה (לא חובה)
            </label>
            <textarea
              id="stock-adjust-note"
              className={textareaClass}
              placeholder='למשל: "החזרת ספק" או "ספירת מלאי שנתית"'
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        <SheetFooter>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className={cn(buttonVariants({ size: "lg", variant: "light" }), "w-full justify-center")}
          >
            {submitting ? "שומר..." : "שמירת התאמת מלאי"}
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
