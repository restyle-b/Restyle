"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@prisma/client";
import { Plus, Eye, ShoppingBag, Star, Search } from "lucide-react";
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
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { ProductImage } from "@/components/shop/product-image";
import { ProductPriceCell } from "@/components/admin/products/product-price-cell";
import { ProductSalePriceCell } from "@/components/admin/products/product-sale-price-cell";
import { ProductStockCell } from "@/components/admin/products/product-stock-cell";
import { ProductToggleCell } from "@/components/admin/products/product-toggle-cell";
import { ProductRowActions } from "@/components/admin/products/product-row-actions";
import { ProductEditSheet } from "@/components/admin/products/product-edit-sheet";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  deleteProduct,
  toggleProductActive,
  toggleProductAvailable,
  toggleProductFeatured,
} from "@/server/actions/admin/products";
import { getStockHealth, type StockHealth } from "@/lib/admin/product-schema";
import { adminInputClass } from "@/lib/admin/form-styles";
import { cn } from "@/lib/utils";

type ProductRow = Product & { category: { nameHe: string } | null };
type Category = { id: string; nameHe: string };
type StockFilter = "all" | StockHealth;
type SortKey = "order" | "name" | "price" | "stock" | "updated";

const STOCK_FILTER_LABEL: Record<StockFilter, string> = {
  all: "הכל",
  healthy: "במלאי",
  low: "מלאי נמוך",
  out: "אזל",
};

export function ProductsTable({ products, categories }: { products: ProductRow[]; categories: Category[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("order");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductRow | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<ProductRow | null>(null);

  const stockCounts = useMemo(() => {
    const counts: Record<StockFilter, number> = { all: products.length, healthy: 0, low: 0, out: 0 };
    for (const p of products) counts[getStockHealth(p.stock)]++;
    return counts;
  }, [products]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = products.filter((p) => {
      if (q && !`${p.nameHe} ${p.nameEn ?? ""} ${p.nameAr ?? ""}`.toLowerCase().includes(q)) return false;
      if (categoryFilter && p.categoryId !== categoryFilter) return false;
      if (stockFilter !== "all" && getStockHealth(p.stock) !== stockFilter) return false;
      if (featuredOnly && !p.featured) return false;
      return true;
    });

    rows = [...rows].sort((a, b) => {
      let diff = 0;
      switch (sortKey) {
        case "name":
          diff = a.nameHe.localeCompare(b.nameHe, "he");
          break;
        case "price":
          diff = a.priceAgorot - b.priceAgorot;
          break;
        case "stock":
          diff = a.stock - b.stock;
          break;
        case "updated":
          diff = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        default:
          diff = a.order - b.order;
      }
      return sortDir === "asc" ? diff : -diff;
    });

    return rows;
  }, [products, search, categoryFilter, stockFilter, featuredOnly, sortKey, sortDir]);

  async function handleDelete() {
    if (!deletingProduct) return;
    const result = await deleteProduct(deletingProduct.id);
    if (result.ok) {
      toast.success("המוצר נמחק");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="חיפוש מוצר..."
              className={cn(adminInputClass, "w-56 ps-9")}
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={cn(adminInputClass, "w-auto")}
          >
            <option value="">כל הקטגוריות</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameHe}
              </option>
            ))}
          </select>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className={cn(adminInputClass, "w-auto")}
          >
            <option value="order">מיון: סדר תצוגה</option>
            <option value="name">מיון: שם</option>
            <option value="price">מיון: מחיר</option>
            <option value="stock">מיון: מלאי</option>
            <option value="updated">מיון: עודכן לאחרונה</option>
          </select>
          <button
            type="button"
            onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
            className="rounded-md border border-line-dark px-3 py-2 text-sm text-neutral-300 transition-colors hover:border-accent hover:text-white"
          >
            {sortDir === "asc" ? "עולה" : "יורד"}
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingProduct(null);
            setSheetOpen(true);
          }}
          className={cn(buttonVariants({ size: "md" }))}
        >
          <Plus className="h-4 w-4" />
          הוספת מוצר
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {(["all", "healthy", "low", "out"] as StockFilter[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setStockFilter(key)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
              stockFilter === key
                ? "border-accent bg-accent text-ink"
                : "border-line-dark text-neutral-300 hover:bg-white/5",
            )}
          >
            {STOCK_FILTER_LABEL[key]} ({stockCounts[key]})
          </button>
        ))}
        <button
          type="button"
          onClick={() => setFeaturedOnly((v) => !v)}
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors",
            featuredOnly ? "border-accent bg-accent text-ink" : "border-line-dark text-neutral-300 hover:bg-white/5",
          )}
        >
          <Star className="h-3.5 w-3.5" />
          מובלטים בלבד
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-center text-neutral-400">אין מוצרים התואמים את הסינון.</p>
      ) : (
        <div className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>מוצר</TableHead>
                <TableHead>מחיר</TableHead>
                <TableHead>מחיר מבצע</TableHead>
                <TableHead>מלאי</TableHead>
                <ColumnIconHead icon={ShoppingBag} label="זמינות לרכישה" />
                <ColumnIconHead icon={Eye} label="נראות בחנות" />
                <ColumnIconHead icon={Star} label="הבלטה" />
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <ProductImage
                        imageUrl={product.imageUrl}
                        label={product.nameHe}
                        className="h-11 w-11 shrink-0 rounded-md object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-white">{product.nameHe}</p>
                        <p className="truncate text-xs text-neutral-500">
                          {product.category?.nameHe ?? "ללא קטגוריה"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <ProductPriceCell id={product.id} priceAgorot={product.priceAgorot} />
                  </TableCell>
                  <TableCell>
                    <ProductSalePriceCell id={product.id} salePriceAgorot={product.salePriceAgorot} />
                  </TableCell>
                  <TableCell>
                    <ProductStockCell id={product.id} stock={product.stock} />
                  </TableCell>
                  <TableCell>
                    <ProductToggleCell
                      id={product.id}
                      checked={product.available}
                      ariaLabel={`זמינות לרכישה — ${product.nameHe}`}
                      onToggle={toggleProductAvailable}
                    />
                  </TableCell>
                  <TableCell>
                    <ProductToggleCell
                      id={product.id}
                      checked={product.active}
                      ariaLabel={`נראות בחנות — ${product.nameHe}`}
                      onToggle={toggleProductActive}
                    />
                  </TableCell>
                  <TableCell>
                    <ProductToggleCell
                      id={product.id}
                      checked={product.featured}
                      ariaLabel={`הבלטה — ${product.nameHe}`}
                      onToggle={toggleProductFeatured}
                    />
                  </TableCell>
                  <TableCell>
                    <ProductRowActions
                      onEdit={() => {
                        setEditingProduct(product);
                        setSheetOpen(true);
                      }}
                      onDeleteRequest={() => setDeletingProduct(product)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ProductEditSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        categories={categories}
        product={
          editingProduct
            ? {
                id: editingProduct.id,
                order: editingProduct.order,
                nameHe: editingProduct.nameHe,
                nameEn: editingProduct.nameEn ?? "",
                nameAr: editingProduct.nameAr ?? "",
                descriptionHe: editingProduct.descriptionHe,
                descriptionEn: editingProduct.descriptionEn ?? "",
                descriptionAr: editingProduct.descriptionAr ?? "",
                priceShekels: (editingProduct.priceAgorot / 100).toString(),
                stock: editingProduct.stock,
                imageUrl: editingProduct.imageUrl ?? "",
                categoryId: editingProduct.categoryId ?? "",
                active: editingProduct.active,
              }
            : null
        }
      />

      <ConfirmDialog
        open={deletingProduct !== null}
        onOpenChange={(open) => !open && setDeletingProduct(null)}
        title="מחיקת מוצר"
        description={`למחוק את "${deletingProduct?.nameHe}" לצמיתות? הפעולה אינה הפיכה.`}
        confirmLabel="מחיקה"
        onConfirm={handleDelete}
      />
    </div>
  );
}

function ColumnIconHead({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <TableHead>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="flex items-center justify-center">
            <Icon className="h-4 w-4" />
            <span className="sr-only">{label}</span>
          </span>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TableHead>
  );
}
