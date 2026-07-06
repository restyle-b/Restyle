"use client";

import { MoreHorizontal, Pencil, Trash2, Copy, ExternalLink, PackagePlus, History } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export function ProductRowActions({
  product,
  onEdit,
  onDeleteRequest,
  onDuplicate,
  onAdjustStock,
  onViewInventoryHistory,
}: {
  product: { slug: string; active: boolean; publishAt: Date | null };
  onEdit: () => void;
  onDeleteRequest: () => void;
  onDuplicate: () => void;
  onAdjustStock: () => void;
  onViewInventoryHistory: () => void;
}) {
  // "מתפרסם" = active וגם (לא מתוזמן, או שהתזמון כבר עבר) — אותה נוסחה כמו
  // ה-WHERE הציבורי ב-get-products.ts, מחושבת כאן מקומית מנתוני השורה עצמה.
  const isPublished = product.active && (product.publishAt === null || product.publishAt.getTime() <= Date.now());

  function handlePreview() {
    if (!isPublished) return;
    window.open(`/shop/${product.slug}`, "_blank", "noopener,noreferrer");
  }

  return (
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
        <DropdownMenuItem onSelect={onEdit}>
          <Pencil className="h-4 w-4" />
          עריכת פרטים מלאים
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onDuplicate}>
          <Copy className="h-4 w-4" />
          שכפול
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onAdjustStock}>
          <PackagePlus className="h-4 w-4" />
          התאמת מלאי
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onViewInventoryHistory}>
          <History className="h-4 w-4" />
          היסטוריית מלאי
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {isPublished ? (
          <DropdownMenuItem onSelect={handlePreview}>
            <ExternalLink className="h-4 w-4" />
            תצוגה מקדימה
          </DropdownMenuItem>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <DropdownMenuItem disabled onSelect={(e) => e.preventDefault()}>
                  <ExternalLink className="h-4 w-4" />
                  תצוגה מקדימה
                </DropdownMenuItem>
              </div>
            </TooltipTrigger>
            <TooltipContent>זמין לתצוגה לאחר פרסום</TooltipContent>
          </Tooltip>
        )}
        <DropdownMenuItem onSelect={onDeleteRequest} destructive>
          <Trash2 className="h-4 w-4" />
          מחיקה
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
