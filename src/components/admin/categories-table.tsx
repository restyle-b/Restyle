"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@prisma/client";
import { Plus, MoreHorizontal, Pencil, Copy, Trash2, ChevronUp, ChevronDown } from "lucide-react";
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
import { CategoryEditSheet } from "@/components/admin/category-edit-sheet";
import {
  deleteCategory,
  duplicateCategory,
  reorderCategory,
  toggleCategoryActive,
} from "@/server/actions/admin/categories";
import { cn } from "@/lib/utils";

type CategoryRow = Category & { _count: { products: number } };

export function CategoriesTable({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryRow | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<CategoryRow | null>(null);

  async function handleDelete() {
    if (!deletingCategory) return;
    const result = await deleteCategory(deletingCategory.id);
    if (result.ok) {
      toast.success("הקטגוריה נמחקה");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleDuplicate(category: CategoryRow) {
    const result = await duplicateCategory(category.id);
    if (result.ok) {
      toast.success("הקטגוריה שוכפלה כטיוטה");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleReorder(category: CategoryRow, direction: "up" | "down") {
    const result = await reorderCategory(category.id, direction);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-neutral-400">{categories.length} קטגוריות</p>
        <button
          type="button"
          onClick={() => {
            setEditingCategory(null);
            setSheetOpen(true);
          }}
          className={cn(buttonVariants({ size: "md" }))}
        >
          <Plus className="h-4 w-4" />
          קטגוריה חדשה
        </button>
      </div>

      {categories.length === 0 ? (
        <p className="mt-8 text-center text-neutral-400">אין קטגוריות עדיין.</p>
      ) : (
        <div className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>שם</TableHead>
                <TableHead>מספר מוצרים</TableHead>
                <TableHead>פעילה</TableHead>
                <TableHead>סדר</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category, index) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <p className="font-medium text-white">{category.nameHe}</p>
                    {category.nameEn && <p className="text-xs text-neutral-500">{category.nameEn}</p>}
                  </TableCell>
                  <TableCell>{category._count.products}</TableCell>
                  <TableCell>
                    <CategoryActiveToggle
                      id={category.id}
                      checked={category.active}
                      nameHe={category.nameHe}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleReorder(category, "up")}
                        disabled={index === 0}
                        aria-label={`הזזת "${category.nameHe}" למעלה`}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReorder(category, "down")}
                        disabled={index === categories.length - 1}
                        aria-label={`הזזת "${category.nameHe}" למטה`}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
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
                        <DropdownMenuItem
                          onSelect={() => {
                            setEditingCategory(category);
                            setSheetOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                          עריכה
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleDuplicate(category)}>
                          <Copy className="h-4 w-4" />
                          שכפול
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setDeletingCategory(category)} destructive>
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

      <CategoryEditSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        category={
          editingCategory
            ? {
                id: editingCategory.id,
                order: editingCategory.order,
                nameHe: editingCategory.nameHe,
                nameEn: editingCategory.nameEn ?? "",
                nameAr: editingCategory.nameAr ?? "",
                active: editingCategory.active,
              }
            : null
        }
      />

      <ConfirmDialog
        open={deletingCategory !== null}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
        title="מחיקת קטגוריה"
        description={`למחוק את "${deletingCategory?.nameHe}"? מוצרים משויכים יישארו ללא קטגוריה.`}
        confirmLabel="מחיקה"
        onConfirm={handleDelete}
      />
    </div>
  );
}

function CategoryActiveToggle({
  id,
  checked,
  nameHe,
}: {
  id: string;
  checked: boolean;
  nameHe: string;
}) {
  const router = useRouter();
  const [optimistic, setOptimistic] = useState(checked);
  const [isPending, startTransition] = useTransition();

  return (
    <Switch
      checked={optimistic}
      disabled={isPending}
      aria-label={`נראות בחנות — ${nameHe}`}
      onCheckedChange={(value) => {
        setOptimistic(value);
        startTransition(async () => {
          const result = await toggleCategoryActive(id, value);
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
